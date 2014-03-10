from scrapy.spider import Spider
from scrapy.selector import Selector
from scrapy.http import HtmlResponse
from urlparse import urljoin
import unicodedata as ud
from urllib import urlopen

from craiglist.items import CityItem

class CitySpider(Spider):
    name = "city"
    allowed_domains = ["craigslist.org"]
    
    start_urls = ["http://geo.craigslist.org/iso/us"]


    def parse(self, response):
        items = []

        print "Crawling", response.url
        sel = Selector(response)
        rows = sel.xpath('//a')
            
        rows = sel.xpath('//div[@id="list"]/a/@href').extract()
        for row in rows:
            item = CityItem()

            item["url"] = row
            items.append(item)
        return items

    