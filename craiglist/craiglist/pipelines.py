# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

import json

class JsonWriterPipeline(object):

    def __init__(self):
    	self.file_map = {}

    def get_file(self, city, rel):
    	#print "Looking for", city,rel
    	k = (city,rel)
    	if self.file_map.get(k) is not None:
    		return self.file_map.get(k)
    	else:
    		fname = "data/" + city+"-"+rel+".json"
    		self.file_map[k] = open(fname, 'a+b')
    		return self.file_map[k]

    def process_item(self, item, spider):
    	city = item["city"]
    	rel = item["rel"]
        line = json.dumps(dict(item)) + "\n"
        f = self.get_file(city,rel)
        if f:
            f.write(line)
        return item

class UrlWriterPipeline(object):

    def __init__(self):
    	self.f = open("urls.txt",'w')


    def process_item(self, item, spider):
    	url = item["url"]
        self.f.write(url)
        self.f.write("\n")
        return item        