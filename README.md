# patrol-map
I'm the best skier on the mountain

### Adding Maps
This website is really useful for labelling: https://solothought.com/imglab/#

Draw bounding boxes around each run name, then set the name using the `Category Name` field. Ignore any capitals, but make sure to get punctuation correct. Once all the runs are labelled, save the result as `COCO JSON` and add the file to the `annotation/` folder. Then do

```
cd annotation
python parse.py
```

### TODO
- Add more maps and support switching
- Fix weird display on mobile when keyboard present
- Store results and weigh choice of run by how often it is guessed incorrectly
- Add mode for guess location, where all runs are initially blocked out, and you need to click on the where the run is