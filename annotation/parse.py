import os
import json
import math
import numpy as np
from collections import defaultdict


def formatName(name):
    # Capitalize first letter of each word
    name = name.title()

    # Title capitalizes 's to 'S, fix that
    name = name.replace("'S", "'s")

    # Honor the GOAT
    name = name.replace("Mcconkey", "McConkey")

    # C2
    name = name.replace("Cii", "CII")

    return name


def dist(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def isRectangle(bbox):
    return (
        (bbox[1] == bbox[3])
        and (bbox[2] == bbox[4])
        and (bbox[5] == bbox[7])
        and (bbox[6] == bbox[0])
    )


# Convert a COCO format annotation that is a rectangle into
# a FE definition of a box, which is left, top, width, height
# and a rotation in degrees.
def getRectangleBox(bbox):
    left = min(bbox[::2])
    top = min(bbox[1::2])

    horizontalFirst = bbox[1] == bbox[3]

    if horizontalFirst:
        width = abs(bbox[0] - bbox[2])
        height = abs(bbox[3] - bbox[5])
    else:
        width = abs(bbox[2] - bbox[4])
        height = abs(bbox[1] - bbox[3])

    rotationDeg = 0

    return {
        "left": left,
        "top": top,
        "width": width,
        "height": height,
        "rotationDeg": rotationDeg,
    }


# Convert a COCO format annotation that is a polygon into
# a FE definition of a box, which is left, top, width, height
# and a rotation in degrees. This assumes that the polygon
# is roughly a rotated rectangle.
def getPolygonBox(bbox):
    # Get center point of rectangle
    centerX = sum(bbox[::2]) / 4
    centerY = sum(bbox[1::2]) / 4

    # Get height and width
    d1 = dist(bbox[0], bbox[1], bbox[2], bbox[3])
    d2 = dist(bbox[2], bbox[3], bbox[4], bbox[5])
    d3 = dist(bbox[4], bbox[5], bbox[6], bbox[7])
    d4 = dist(bbox[6], bbox[7], bbox[0], bbox[1])

    # Take average of distances
    width = (d1 + d3) / 2 + 10
    height = (d2 + d4) / 2 + 10

    # Make sure w > h, and calculate rotation of rectangle
    if width < height:
        width, height = height, width
        # 2->3 and 1->4 are long edges
        y = ((bbox[5] - bbox[3]) + (bbox[7] - bbox[1])) / 2
        x = ((bbox[4] - bbox[2]) + (bbox[6] - bbox[0])) / 2
        rot = -np.arctan2(y, x)  # Not sure why, but this needs to be made negative
    else:
        # 1->2 and 4->3 are long edges
        y = ((bbox[3] - bbox[1]) + (bbox[5] - bbox[7])) / 2
        x = ((bbox[2] - bbox[0]) + (bbox[4] - bbox[6])) / 2
        rot = -np.arctan2(y, x)  # Not sure why, but this needs to be made negative

    # Constrain rotation between [-pi/2, pi/2]
    if rot > (np.pi / 2):
        rot -= np.pi
    if rot < (-np.pi / 2):
        rot += np.pi

    # Convert to degress
    rotationDeg = np.rad2deg(rot)

    # Calculate upper left corner
    left = centerX - width / 2 * np.cos(rot) - height / 2 * np.sin(rot)
    # Top calculation has opposite sign from what you'd expect because larger Y
    # is farther down in the image
    top = centerY - height / 2 * np.cos(rot) + width / 2 * np.sin(rot)

    return {
        "left": left,
        "top": top,
        "width": width,
        "height": height,
        "rotationDeg": rotationDeg,
    }


for file in os.listdir("input"):
    with open(f"input/{file}") as f:
        data = json.load(f)

    labels = {
        c["id"]: formatName(c["name"])
        for c in data["categories"]
        if c["name"] != "uncategorized"
    }

    runs = defaultdict(lambda: [])

    for annotation in data["annotations"]:
        if annotation["category_id"] not in labels:
            continue

        label = labels[annotation["category_id"]]

        # [x1, y1, x2, y2, x3, y3, x4, y4]
        #  0   1   2   3   4   5   6   7
        bbox = annotation["segmentation"][0]

        if isRectangle(bbox):
            box = getRectangleBox(bbox)
        else:
            box = getPolygonBox(bbox)

        # Add this box to the runs dict
        runs[label].append(box)

    # Convert runs dict into array of run objects
    output = [{"name": name, "boxes": boxes} for name, boxes in runs.items()]

    with open(f"output/{file}", "w") as f:
        f.write(json.dumps(output))
