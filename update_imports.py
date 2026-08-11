import os
import re

def update_imports(directory, depth):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                
                # Calculate how many '../' we need to add based on depth
                # depth=1 for src/pages/mobile/ (since original was src/pages/)
                # If a file was in src/pages/auth/, original was '../', new should be '../../'
                # Actually, let's just prepend an extra '../' to all relative imports that go up a level!
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to find `from '../` or `import x from '../`
                # Let's just blindly replace `from '../` with `from '../../` and `from '../../` with `from '../../../`
                # To do this safely, we reverse the replacement order or use a regex function
                
                def replacer(match):
                    return match.group(1) + '../' + match.group(2)
                
                new_content = re.sub(r"(from\s+['\"]|import\s+['\"])(\.\./)", replacer, content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

update_imports('src/pages/desktop', 1)
update_imports('src/pages/mobile', 1)
