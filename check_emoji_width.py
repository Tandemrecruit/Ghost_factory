import unicodedata

emojis = {
    "detective_neutral": "🕵️",
    "detective_man": "🕵️‍♂️",
    "monocle": "🧐",
    "stopwatch": "⏱️"
}

print(f"{'Name':<20} {'Chars':<10} {'Hex':<30} {'EAW Types'}")
print("-" * 80)

for name, char in emojis.items():
    hex_vals = " ".join([f"{ord(c):X}" for c in char])
    eaw_types = " ".join([unicodedata.east_asian_width(c) for c in char])
    print(f"{name:<20} {len(char):<10} {hex_vals:<30} {eaw_types}")
