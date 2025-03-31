import pandas as pd
from pymongo import MongoClient

# Load only routes and stops
routes = pd.read_csv("gtfs-data/routes.txt")
stops = pd.read_csv("gtfs-data/stops.txt")

# Connect to MongoDB
# Connect to your MongoDB Atlas
client = MongoClient(
    "mongodb+srv://Admin:Admin@cluster0.uxdft.mongodb.net/DB11?retryWrites=true&w=majority"
)
db = client.DB11  # Your existing database

# Insert data (skip if already exists to avoid duplicates)
if "routes" not in db.list_collection_names():
    db.routes.insert_many(routes.to_dict("records"))
    print("✅ Routes uploaded to MongoDB Atlas!")

if "stops" not in db.list_collection_names():
    db.stops.insert_many(stops.to_dict("records"))
    print("✅ Stops uploaded to MongoDB Atlas!")
else:
    print("Collections already exist. Skipping upload.")