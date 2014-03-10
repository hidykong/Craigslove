# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

from scrapy.item import Item, Field

class CraiglistItem(Item):
    # define the fields for your item here like:
    # name = Field()
    city = Field()
    rel = Field()
    age = Field()
    desc = Field()
    post_date = Field()
    pass



class CityItem(Item):
	city = Field()
	url = Field()