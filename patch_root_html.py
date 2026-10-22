import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# 1. Remove Save Date button block
content = re.sub(
    r'\s*<div class="countdown-calendar-cta"[^>]*>.*?</div>',
    '',
    content, flags=re.DOTALL
)

# 2. Remove chapter badges
content = re.sub(r'\s*<span class="love-story-chapter-badge">Chapter [IVX]+</span>', '', content)

# 3. Remove tap-cue spans
content = re.sub(r'\s*<span class="love-story-tap-cue">[^<]*</span>', '', content)

# 4. Remove swatch-hex spans
content = re.sub(r'\s*<span class="swatch-hex">[^<]*</span>', '', content)

# 5. Remove static gallery grid section
content = re.sub(
    r'\n\s*<!-- 2\. COMPLETE PHOTO GALLERY.*?</div>\s*\n\s*</div>\s*\n\s*</section>',
    '\n      <!-- Gallery grid removed; photos accessible via scrolling reel above -->\n    </section>',
    content, flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Removed:', original_len - len(content), 'chars')
print('gallery-grid-title remaining:', content.count('gallery-grid-title'))
print('chapter-badge remaining:', content.count('love-story-chapter-badge'))
print('tap-cue remaining:', content.count('love-story-tap-cue'))
print('swatch-hex remaining:', content.count('swatch-hex'))
print('countdownSaveDateBtn remaining:', content.count('countdownSaveDateBtn'))
