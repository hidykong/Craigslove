# Scrapy settings for craiglist project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/en/latest/topics/settings.html
#

BOT_NAME = 'craiglist'

LOG_LEVEL = 'INFO' 

DOWNLOAD_DELAY = 0.35

SPIDER_MODULES = ['craiglist.spiders']
NEWSPIDER_MODULE = 'craiglist.spiders'

# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = 'craiglist (+http://www.yourdomain.com)'

ITEM_PIPELINES = {
    'craiglist.pipelines.JsonWriterPipeline': 800,
    #'craiglist.pipelines.UrlWriterPipeline': 800
}