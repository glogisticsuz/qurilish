import os

def replace_in_files(target_dir, search_text, replace_text):
    for root, dirs, files in os.walk(target_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.py', '.html', '.css', '.json', '.md')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if search_text in content:
                        new_content = content.replace(search_text, replace_text)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated: {file_path}")
                except Exception as e:
                    print(f"Error in {file_path}: {e}")

if __name__ == "__main__":
    replace_in_files('c:/Users/king/Desktop/yangiUstalar', 'HamkorQurilish', 'HamkorQurilish')
    replace_in_files('c:/Users/king/Desktop/yangiUstalar', 'hamkorqurilish', 'hamkorqurilish')
