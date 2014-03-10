import json

class JsonWriterPipeline(object):

    def __init__(self):
    	self.file_map = {}

    def get_file(self, city, rel):
    	if file_map.get((city,rel)) is None:
    		return file_map.get((city,rel))
    	else:
    		fname = city+"-"+rel+".json"
    		file_map[(city,rel)] = open(fname, 'wb')
    		return file_map[(city,rel)]

    def process_item(self, item, spider):
    	city = item["city"]
    	rel = item["rel"]
        line = json.dumps(dict(item)) + "\n"
        f = self.get_file((city,rel))
        if f:
            f.write(line)
        return item