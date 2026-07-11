import os
import requests
import base64

GITHUB_TOKEN = "你的GitHub Personal Access Token"
REPO_OWNER = "wzyy886"
REPO_NAME = "AI123"
BRANCH = "main"

def get_repo_sha():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{BRANCH}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["object"]["sha"]
    return None

def get_tree_sha(commit_sha):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/commits/{commit_sha}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["tree"]["sha"]
    return None

def create_tree(base_tree_sha, files):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/trees"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Content-Type": "application/json"}
    
    tree = []
    for filepath, content in files.items():
        encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
        tree.append({
            "path": filepath,
            "mode": "100644",
            "type": "blob",
            "content": encoded_content
        })
    
    data = {"base_tree": base_tree_sha, "tree": tree}
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        return response.json()["sha"]
    print(f"创建tree失败: {response.status_code} - {response.text}")
    return None

def create_commit(parent_sha, tree_sha, message):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/commits"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Content-Type": "application/json"}
    
    data = {
        "message": message,
        "parents": [parent_sha],
        "tree": tree_sha
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        return response.json()["sha"]
    print(f"创建commit失败: {response.status_code} - {response.text}")
    return None

def update_ref(commit_sha):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{BRANCH}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Content-Type": "application/json"}
    
    data = {"sha": commit_sha}
    response = requests.patch(url, headers=headers, json=data)
    return response.status_code == 200

def upload_file(filepath, content):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{filepath}"
    headers = {"Authorization": f"token {GITHUB_TOKEN}"}
    
    encoded_content = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    data = {
        "message": f"更新 {filepath}",
        "content": encoded_content,
        "branch": BRANCH
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data["sha"] = response.json()["sha"]
    
    response = requests.put(url, headers=headers, json=data)
    return response.status_code in [200, 201]

def get_all_files(root_dir):
    files = {}
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in ['.git', 'node_modules', '.idea']]
        for filename in filenames:
            if filename not in ['.gitignore', '.DS_Store']:
                full_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        files[rel_path] = f.read()
                except:
                    print(f"跳过文件: {rel_path}")
    return files

def main():
    print("=== 上传项目到 GitHub ===")
    print(f"仓库: {REPO_OWNER}/{REPO_NAME}")
    print(f"分支: {BRANCH}")
    
    if not GITHUB_TOKEN or GITHUB_TOKEN == "你的GitHub Personal Access Token":
        print("请先在脚本中配置你的GitHub Token！")
        print("获取方式: https://github.com/settings/tokens")
        return
    
    print("\n正在读取项目文件...")
    project_dir = os.path.dirname(os.path.abspath(__file__))
    files = get_all_files(project_dir)
    print(f"共读取 {len(files)} 个文件")
    
    print("\n正在获取仓库信息...")
    commit_sha = get_repo_sha()
    if not commit_sha:
        print("获取仓库信息失败，请检查Token和仓库名是否正确")
        return
    
    tree_sha = get_tree_sha(commit_sha)
    if not tree_sha:
        print("获取tree信息失败")
        return
    
    print("\n正在上传文件...")
    success_count = 0
    fail_count = 0
    
    for filepath, content in files.items():
        print(f"上传: {filepath}")
        if upload_file(filepath, content):
            success_count += 1
        else:
            fail_count += 1
            print(f"  ❌ 上传失败")
    
    print(f"\n=== 上传完成 ===")
    print(f"成功: {success_count}")
    print(f"失败: {fail_count}")
    print(f"仓库地址: https://github.com/{REPO_OWNER}/{REPO_NAME}")

if __name__ == "__main__":
    main()
