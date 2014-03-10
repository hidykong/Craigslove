from scrapy.spider import Spider

class CraiglistSpider(Spider):
    name = "craiglist"
    allowed_domains = ["craigslist.org"]
    start_urls = [
        "http://chambana.craigslist.org/search/w4m"
    ]

    def parse(self, response):
        sel = Selector(response)
        rows = sel.xpath('//p[@class="row"]')

        items = []
        for row in rows:
        	item = CraiglistItem()
            item["date"] = row.xpath('span[@class="pl"]/span[@class="date"]/text()').extract()
            item["desc"] = row.xpath('span[@class="pl"]/a/text()').extract()
            item["link"] = row.xpath('span[@class="pl"]/a/@href').extract()
            item["age"] = row.xpath('span[@class="l2"]/span[@class="price"]/text()').extract()
            #location = row.xpath('span[@class="l2"]/span[@class="pnr"]/text()').extract()
            items.append(item)
            print date, desc, age, link
        return items