import os
import re

def add_webpack_comment_to_file(file_path):
    with open(file_path, 'r', encoding='utf-8-sig') as file:
        content = file.read()

    pattern = r"(const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\.then\(\s*\(v\)\s*=>\s*\(\s*{[^}]*}\s*\)\s*\)\s*;)"

    def replace_with_comment(match):
        variable_name = match.group(2)
        import_path = match.group(3)
        print(f"Matched variable: {variable_name}, import path: {import_path}")
        return f'const {variable_name} = lazy(() => import(/* webpackChunkName: "{variable_name}" */ {import_path})' + match.group(1)[match.group(1).index('then'):]

    new_content = re.sub(pattern, replace_with_comment, content)

    if new_content != content:
        with open(file_path, 'w') as file:
            file.write(new_content)
        print(f"Updated: {file_path}")

def add_webpack_comments_to_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                print(file_path)
                add_webpack_comment_to_file(file_path)

directory_path = '../fsd'
add_webpack_comments_to_directory(directory_path)