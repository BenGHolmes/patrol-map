import json
import math
import numpy as np


def dist(x1, y1, x2, y2):
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def isRectangle(bbox):
    return (
        (bbox[1] == bbox[3])
        and (bbox[2] == bbox[4])
        and (bbox[5] == bbox[7])
        and (bbox[6] == bbox[0])
    )


# Opening JSON file
with open("public-map.json") as f:
    data = json.load(f)

labels = {
    c["id"]: c["name"].title()
    for c in data["categories"]
    if c["name"] != "uncategorized"
}

runs = {}

for annotation in data["annotations"]:
    if annotation["category_id"] not in labels:
        continue

    label = labels[annotation["category_id"]]

    # [x1, y1, x2, y2, x3, y3, x4, y4]
    #  0   1   2   3   4   5   6   7
    bbox = annotation["segmentation"][0]

    if isRectangle(bbox):
        left = min(bbox[::2])
        top = max(bbox[1::2])

        horizontalFirst = bbox[1] == bbox[3]

        if horizontalFirst:
            width = abs(bbox[0] - bbox[2])
            height = abs(bbox[3] - bbox[5])
        else:
            width = abs(bbox[2] - bbox[4])
            height = abs(bbox[1] - bbox[3])

        rotationDeg = 0
    else:
        left = bbox[0]
        top = bbox[1]

        d1 = dist(bbox[0], bbox[1], bbox[2], bbox[3])
        d2 = dist(bbox[2], bbox[3], bbox[4], bbox[5])
        d3 = dist(bbox[4], bbox[5], bbox[6], bbox[7])
        d4 = dist(bbox[6], bbox[7], bbox[0], bbox[1])

        # Take average of distances
        l = (d1 + d3) / 2
        w = (d2 + d4) / 2

    box = {left, top, width, height, rotationDeg}
