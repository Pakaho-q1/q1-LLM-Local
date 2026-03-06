import subprocess
import json
import os
import hashlib
from datetime import datetime
from pathlib import Path

CONFIG_FILE = "git-upload-config.json"
CACHE_FILE = ".git-upload-cache.json"


def run(cmd_list):
    """รันคำสั่งอย่างปลอดภัยด้วย shell=False"""
    try:
        return subprocess.run(cmd_list, shell=False, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error executing {' '.join(cmd_list)}: {e}")
        return None


def run_capture(cmd_list):
    """รันคำสั่งและดึงผลลัพธ์ออกมา"""
    try:
        return subprocess.check_output(cmd_list, shell=False).decode().strip()
    except:
        return None


def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ Error: {CONFIG_FILE} not found!")
        exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_file_hash(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def ensure_git_repo():
    if not Path(".git").exists():
        print("🚀 Initializing git repository...")
        run(["git", "init"])


def detect_branch(config):
    target_branch = config.get("default_branch", "main") # แนะนำให้ใช้ main แทน master
    run(["git", "branch", "-M", target_branch])
    return target_branch


def create_gitignore(patterns):
    gitignore = Path(".gitignore")
    print("📝 Syncing .gitignore with config patterns...")
    with open(gitignore, "w", encoding="utf-8") as f:
        for p in patterns:
            f.write(p + "\n")


def apply_gitignore():
    print("🔄 Applying .gitignore rules...")
    has_index = run_capture(["git", "ls-files"])
    if has_index:
        subprocess.run(["git", "rm", "-r", "-f", "--cached", "."], shell=False)
    subprocess.run(["git", "add", "."], shell=False)


def detect_large_files(limit_mb):
    print(f"🔍 Scanning for files larger than {limit_mb}MB...")
    limit = limit_mb * 1024 * 1024
    large_files_found = False

    for path in Path(".").rglob("*"):
        if ".git" in path.parts or "node_modules" in path.parts:
            continue
        if path.is_file():
            try:
                size = path.stat().st_size
                if size > limit:
                    print(f"⚠️ Warning: Large file detected: {path} ({size / (1024*1024):.2f} MB)")
                    large_files_found = True
            except OSError:
                continue

    if large_files_found:
        confirm = input("\n🚨 Large files detected! Do you want to continue anyway? (y/n): ")
        if confirm.lower() != "y":
            print("❌ Upload cancelled. Please remove or use Git LFS for large files.")
            exit(1)


def apply_gitignore_smartly():
    print("🧹 Updating Git index and merging sub-modules...")
    try:
        # แก้ไขจุดที่ 1: เพิ่ม -c เพื่อบอกให้ Git ค้นหาในไฟล์ที่ถูก Track แล้ว (แก้ Error fatal)
        ignored_but_tracked = run_capture(["git", "ls-files", "-i", "-c", "--exclude-standard"])
        if ignored_but_tracked:
            files_to_remove = ignored_but_tracked.splitlines()
            for file_path in files_to_remove:
                if file_path.strip():
                    run(["git", "rm", "--cached", "-r", "--ignore-unmatch", file_path])

        # บังคับ add ทั้งหมด
        run(["git", "add", "-A"]) 
        print("✅ Git index updated successfully.")
    except Exception as e:
        print(f"❌ Error: {e}")


def commit_preview():
    print("\n--- Current Git Status ---")
    run(["git", "status", "-s"])
    print("\n--- Changes Summary ---")
    run(["git", "--no-pager", "diff", "--cached", "--stat"])


def commit(config):
    status = run_capture(["git", "status", "--porcelain"])
    if not status:
        print("✨ ไม่มีอะไรเปลี่ยนแปลง (Nothing to commit)")
        return False 

    print("📝 กำลังสร้าง Commit...")
    message = config.get("auto_commit_message", "🤖 Auto commit: {date}").format(
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    
    if config.get("ask_for_message"):
        custom_message = input(f"💬 ใส่ข้อความ Commit (กด Enter เพื่อใช้ '{message}'): ").strip()
        if custom_message:
            message = custom_message

    run(["git", "commit", "-m", message])
    return True


def push(remote, branch):
    """แก้ไขจุดที่ 2: ระบบจัดการตอนถูก Rejected และจัดการ Conflict"""
    print(f"\n🚀 Pushing to {remote}/{branch}...")
    
    # ใช้ subprocess เพื่อดึง Error ออกมาเช็กได้
    result = subprocess.run(["git", "push", "-u", remote, branch], capture_output=True, text=True)
    
    if result.returncode != 0:
        if "rejected" in result.stderr or "fetch first" in result.stderr:
            print("\n⚠️ การ Push ถูกปฏิเสธ! เนื่องจากบน GitHub มีข้อมูลที่ใหม่กว่า")
            confirm_pull = input("❓ คุณต้องการดึงข้อมูลล่าสุด (Git Pull) มาลงเครื่องก่อนหรือไม่? (y/n): ")
            
            if confirm_pull.lower() == 'y':
                print(f"📥 กำลัง Pull ข้อมูลจาก {remote}/{branch}...")
                pull_res = subprocess.run(["git", "pull", remote, branch], capture_output=True, text=True)
                
                # เช็กว่าเกิด Conflict ไหม
                if "conflict" in pull_res.stdout.lower() or "conflict" in pull_res.stderr.lower():
                    print("\n🚨 เกิดข้อขัดแย้ง (Conflict) ในไฟล์!")
                    print("💡 วิธีเลือกโค้ด:")
                    print("1) ใช้ 'โค้ดใหม่' ของเราทั้งหมด (Ours)")
                    print("2) ใช้ 'โค้ดเก่า' จาก Server ทั้งหมด (Theirs)")
                    print("3) ฉันจะไปแก้เองในโปรแกรม Editor (Manual)")
                    
                    choice = input("👉 เลือกวิธีจัดการ (1/2/3): ")
                    
                    if choice == "1":
                        run(["git", "checkout", "--ours", "."])
                        run(["git", "add", "."])
                        run(["git", "commit", "-m", "✅ Resolved conflicts using our changes"])
                    elif choice == "2":
                        run(["git", "checkout", "--theirs", "."])
                        run(["git", "add", "."])
                        run(["git", "commit", "-m", "✅ Resolved conflicts using remote changes"])
                    else:
                        print("🛠️ กรุณาเปิดไฟล์ที่ติด Conflict แก้ไขให้เรียบร้อย แล้วรันสคริปต์นี้ใหม่อีกครั้ง")
                        return False

                # ลอง Push อีกรอบ
                print("🔄 กำลังลอง Push อีกครั้ง...")
                retry = subprocess.run(["git", "push", "-u", remote, branch])
                if retry.returncode == 0:
                    return True
                else:
                    return False
        else:
            print(f"❌ Error during push:\n{result.stderr}")
            return False
            
    return True


def main():
    try:
        config = load_config()
        ensure_git_repo()

        create_gitignore(config["ignore_patterns"])

        remote_name = config.get("remote_name", "origin")

        remote_url = run_capture(["git", "remote", "get-url", remote_name])
        if not remote_url:
            print(f"❌ ไม่พบ Remote ที่ชื่อ '{remote_name}'")
            url_input = input("🔗 กรุณาใส่ Git Remote URL: ").strip()
            if url_input:
                run(["git", "remote", "add", remote_name, url_input])
                remote_url = url_input
            else:
                return

        detect_large_files(config.get("large_file_limit_mb", 100))
        apply_gitignore_smartly()

        commit_preview()

        print(f"\n⚠️ กำลังจะส่งโค้ดไปที่: {remote_url}")
        confirm = input("❓ ยืนยันการ Commit และ Push หรือไม่? (y/n): ")
        
        if confirm.lower() == "y":
            is_committed = commit(config) 
            
            # ถึงจะไม่มีอะไร commit ใหม่ แต่ถ้าครั้งก่อน Push ไม่ผ่าน เราควรยอมให้ Push ได้
            # เลยปรับให้ลอง Push ดูเสมอถ้ากดยืนยัน Y
            branch_name = detect_branch(config)
            success = push(remote_name, branch_name)
            
            if success:
                print("🚀 การส่งข้อมูล (Push) สำเร็จเรียบร้อย!")
            else:
                print("❌ การ Push ล้มเหลว โปรดตรวจสอบข้อความด้านบน")
        else:
            print("❌ ยกเลิกการทำงาน")

        # แก้ไขจุดที่ 3: ลบ Block การเรียก commit() และ push() ซ้ำซ้อนที่เคยมีตรงนี้ออกไป

    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")

    except KeyboardInterrupt:
        print("\n\n👋 ปิดโปรแกรมโดยผู้ใช้")


if __name__ == "__main__":
    main()