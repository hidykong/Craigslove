from scrapy.spider import Spider
from scrapy.selector import Selector
from scrapy.http import HtmlResponse
from urlparse import urljoin
import unicodedata as ud
from urllib import urlopen

from craiglist.items import CraiglistItem

class CraiglistSpider(Spider):
#class CraiglistSpider(CrawlSpider):
    name = "craiglist"
    allowed_domains = ["craigslist.org"]
    #categories = {"m4w": "men seeking women", "w4m":"women seeking men", "m4m":"men seeking men", "w4w":"women seeking women"}
    categories = {"m4m": u"men seeking men", "w4w":u"women seeking women", "m4w": u"men seeking women", "w4m": u"women seeking men"}
    #categories = { "m4w": u"men seeking women" }

    f = open("urls.txt")
    start_urls = [urljoin(url.strip(),cat) for url in f.readlines()[335:] for cat in categories.keys()]
    #valid_dates = [u"mar  2", u"mar  1", u"feb 28", u"feb 27", u"feb 26", u"feb 25", u"feb 24", u"feb 23", u"feb 22"]
    f.close()


    def get_cat(self, cat_desc):
        for x in self.categories.keys():
            if self.categories[x] == cat_desc[0]:
                return x
        return ""

    def parse(self, response):
        found_dates = set()
        if response.request is not None and len(response.request.meta['redirect_urls']) > 0:
            for x in response.request.meta['redirect_urls']:
                for y in self.categories.keys():
                    if x.find(y) >= 0:
                        base_url = x
                        break
        else:
            base_url = response.url
        
        start=100
        city = Selector(response).xpath('//span[@class="crumb"][2]/a/text()').extract()
        rel = Selector(response).xpath('//span[@class="crumb"][4]/a/text()').extract()
        items = []

        while True: 
            print "Crawling", response.url
            sel = Selector(response)
            rows = sel.xpath('//p[@class="row"]')
            if len(rows) == 0 :
                print "No further items in", response.url
                break
            
            

            
            for row in rows:
                item = CraiglistItem()
                post_date = row.xpath('span[@class="pl"]/span[@class="date"]/text()').extract()[0]
                if not post_date.lower().startswith("feb"):
                    #print "Skipping ", post_date
                    continue
                item["post_date"] = post_date
                if(item["post_date"].lower() not in found_dates):
                    found_dates.add(item["post_date"].lower())

                item["desc"] = row.xpath('span[@class="pl"]/a/text()').extract()[0]
                #item["link"] = row.xpath('span[@class="pl"]/a/@href').extract()[0]
                age = row.xpath('span[@class="l2"]/span[@class="price"]/text()').extract()
                item["age"] = ""
                if len(age) > 0:
                    item["age"] = age[0]
                item["city"] = city[0]
                item["rel"] = self.get_cat(rel)
                items.append(item)
            #print "response.request.meta['redirect_urls'] is " ,response.request.meta['redirect_urls']               
            #print "response.request.url is", response.request.url
            print "base_url is", base_url
            if not base_url.endswith("/"):
                base_url=base_url+"/"
            next_url = urljoin(base_url, "index"+str(start)+".html")
            start+=100
            print "next_url is ", next_url
            response = HtmlResponse(next_url, body=urlopen(next_url).read())

        print "Day list for city: ",city, "rel: ",rel, "Dates: ",found_dates
        return items

    