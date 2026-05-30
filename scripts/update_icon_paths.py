from pathlib import Path

replacements = [
    ('href="/favicon.ico"', 'href="/assets/icons/favicon.ico"'),
    ('href="favicon.ico"', 'href="/assets/icons/favicon.ico"'),
    ('href="/icons/apple-touch-icon.png"', 'href="/assets/icons/apple-touch-icon.png"'),
    ('href="../icons/apple-touch-icon.png"', 'href="/assets/icons/apple-touch-icon.png"'),
    ('src="/icons/icon-192.png"', 'src="/assets/icons/icon-192.png"'),
    ('src="../icons/icon-192.png"', 'src="/assets/icons/icon-192.png"'),
    ('src="/icons/icon-512.png"', 'src="/assets/icons/icon-512.png"'),
    ('src="../icons/icon-512.png"', 'src="/assets/icons/icon-512.png"'),
    ('"/icons/icon-192.png"', '"/assets/icons/icon-192.png"'),
    ('"/icons/icon-512.png"', '"/assets/icons/icon-512.png"'),
    ('"/icons/apple-touch-icon.png"', '"/assets/icons/apple-touch-icon.png"'),
    ('https://arabicokids.com/icons/icon-512.png', 'https://arabicokids.com/assets/icons/icon-512.png'),
    ('icons/apple-touch-icon.png', 'assets/icons/apple-touch-icon.png'),
    ('icons/icon-192.png', 'assets/icons/icon-192.png'),
    ('icons/icon-512.png', 'assets/icons/icon-512.png'),
    ('"favicon.ico"', '"/assets/icons/favicon.ico"'),
]

root = Path('.')
count = 0
for path in root.rglob('*'):
    if path.suffix.lower() in {'.html', '.json', '.js', '.css'} and path.is_file():
        text = path.read_text(encoding='utf-8')
        new_text = text
        for old, new in replacements:
            new_text = new_text.replace(old, new)
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            count += 1
print(f'Updated {count} files')
