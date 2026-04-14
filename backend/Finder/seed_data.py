import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lost_found_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Category, Location, Item
from datetime import date

print("Seeding database...")

# Categories
cats = ['Electronics', 'Documents', 'Personal Items', 'Books & Notes', 'Clothing', 'Keys', 'Other']
cat_objs = {}
for c in cats:
    obj, _ = Category.objects.get_or_create(name=c)
    cat_objs[c] = obj

# Locations
locs = [
    ('Canteen', 'Main Building', '1'),
    ('Reading Room', 'Library', '2'),
    ('1st Floor Corridor', 'Main Building', '1'),
    ('2nd Floor', 'Main Building', '2'),
    ('Library', 'Library Building', '1'),
    ('Main Hall', 'Main Building', 'G'),
    ('Lab 301', 'Lab Building', '3'),
    ('Gym', 'Sports Complex', '1'),
]
loc_objs = {}
for name, building, floor in locs:
    obj, _ = Location.objects.get_or_create(name=name, defaults={'building': building, 'floor': floor})
    loc_objs[name] = obj

# Admin user
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@kbtu.kz', 'admin123')
    print("Created admin user: admin / admin123")

# Sample user
if not User.objects.filter(username='student1').exists():
    User.objects.create_user('student1', 'student1@kbtu.kz', 'pass1234', first_name='Inkar', last_name='Askarbekova')

user = User.objects.get(username='student1')

# Sample items
items = [
    ('Black Laptop Bag', 'Black Nike laptop bag with charger inside, found on table near entrance.', 'Personal Items', 'Canteen', '2025-04-10'),
    ('Student ID Card', 'KBTU student ID for Bekov Arsen, found near the printer.', 'Documents', 'Reading Room', '2025-04-11'),
    ('Geometry Notebook', 'Blue notebook with math notes.', 'Books & Notes', '2nd Floor', '2025-04-13'),
    ('Blue Umbrella', 'Blue collapsible umbrella left in library chair.', 'Personal Items', 'Library', '2025-04-12'),
]

for name, desc, cat, loc, date_str in items:
    Item.objects.get_or_create(
        name=name,
        defaults={
            'description': desc,
            'category': cat_objs[cat],
            'location': loc_objs[loc],
            'found_by': user,
            'date_found': date.fromisoformat(date_str),
        }
    )

print("Done! Database seeded successfully.")