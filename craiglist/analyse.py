import json
import re
from nltk import FreqDist
from collections import Counter
from os import listdir
from os.path import isfile, join, splitext
import csv
from collections import defaultdict
import pickle
from pprint import pprint

def get_unigram_array(fname, stopwords, words):
	with open(fname, "r") as f:
		for next_line in f:
			try:
				obj = json.loads(next_line)
			except ValueError, e:
				print "File: ",fname, "Line: ", next_line
				continue
			cur_words = re.findall(r'\w+', obj["desc"])
			for w in cur_words:
				if w.lower() not in stopwords:
					words.append(w.lower())
	return words


def get_bigram_array(fname, stopwords, words):
	with open(fname, "r") as f:
		for next_line in f:
			try:
				obj = json.loads(next_line)
			except ValueError, e:
				print "File: ",fname, "Line: ", next_line
				continue
			cur_words = re.findall(r'\w+', obj["desc"])
			for i in range(1, len(cur_words)): 
				if cur_words[i-1].lower() not in stopwords or cur_words[i].lower() not in stopwords:
					biword = cur_words[i-1].lower() + ' ' + cur_words[i].lower()
					words.append(biword)
	return words



def read_stop_words(fname):
	words = set()
	with open(fname, "r") as f:
		for next_line in f:
			cur_w = next_line.split(",")
			for w in cur_w:
				words.add(w)
	return words

def read_counts(dirname, cities_map, city_state_map, out_map):
	onlyfiles = [ f for f in listdir(dirname) if isfile(join(dirname,f)) ]
	for f in onlyfiles:
		splits = splitext(f)[0].split("-")
		city = splits[0]
		origcity = city
		state = None
		if re.search(r'\s\w\w$', city) is not None:
			origcity = city
			city = city[:-3]
			if city.endswith(","):
				city = city[:-1]
			state = origcity[-2:].upper()
			#print origcity, "|", city, "|", state
		category = splits[-1]
		if out_map.get(origcity) is None and state is not None and city_state_map.get((city, state)) is not None:
			out_map[origcity] = city_state_map.get((city, state))
			out_map[origcity]["origcity"] = origcity
		elif out_map.get(origcity) is None and cities_map.get(city) is not None:
			out_map[origcity] = cities_map.get(city)			
			out_map[origcity]["origcity"] = origcity
		elif out_map.get(origcity) is None:
			#print "No data: ", origcity
			out_map[origcity] = {}			
			out_map[origcity]["origcity"] = origcity
		num_lines = sum(1 for line in open(join(dirname,f)))
		out_map[origcity][category] = num_lines

def read_city_data(fname, cities_map, city_state_map):
	with open(fname,"rb") as f:
		r = csv.reader(f)
		for next in r:
			city = next[3].lower()
			lat = next[1]
			lon = next[2]
			state = next[4]
			my_dict = { "city": city, "lat": lat, "lon" : lon, "state": state}
			cities_map[city] = my_dict
			city_state_map[(city, state)] = my_dict

def stateMapping(sm):
	with open("states.csv","rb") as f:
		rdr = csv.reader(f)
		for next in rdr:
			sm[next[1]] = next[0]


if __name__ == "__main__":
	sm = {}
	stateMapping(sm)
	#pprint(sm)
	in_map = open("city-count.bin", "rb")
	city_map = pickle.load(open("city-count.bin", "rb"))
	word_map = pickle.load(open("word_map.bin", "rb"))
	csv_out = open("output_state.csv","w")
	wr = csv.writer(csv_out)
	header = ["label", "city", "state", "lon", "lat", "m4m", "m4w", "w4m", "w4w", "k1", "c1", "k2", "c2", "k3", "c3", "k4", "c4", "k5", "c5"]
	wr.writerow(header)
	types = [ "m4m", "m4w", "w4w", "w4m"]
	state_map = defaultdict(Counter)
	country_map = Counter()
	state_counter = defaultdict(Counter)
	country_counter = Counter()

	for city in city_map.keys():
		if city_map[city].get("city") is not None and word_map.get(city) is not None:
			#print "Processing ", city
			city_m = city_map[city]

			state = city_m["state"]
			for t in types:
				state_map[state][t] += city_m.get(t,0)
				country_map[t] += city_m.get(t,0)

			words_m = word_map[city]
			for i in range(1,6):
				key = words_m["bkey"+str(i)]
				value = words_m["bcount"+str(i)]
				#print "key",key,"value",value
				state_counter[state][key] += value
				country_counter[key] += value

	#pprint(state_map)
	#pprint(country_map)
	#pprint(sorted(state_counter, key=dict1.get)[:5])
	pprint(country_counter.most_common()[:5])
	for state in state_counter.keys():
		out_list = []
		out_list.append("state")
		out_list.append(sm.get(state))
		out_list.append(state)
		out_list.append(None)
		out_list.append(None)
		out_list.append(state_map[state]["m4m"])
		out_list.append(state_map[state]["m4w"])
		out_list.append(state_map[state]["w4m"])
		out_list.append(state_map[state]["w4w"])
		common_words = state_counter[state].most_common()[:5]
		for i in range(5):
			out_list.append(common_words[i][0])
			out_list.append(common_words[i][1])
		wr.writerow(out_list)
	country_common = country_counter.most_common()[:5]
	pprint(country_common)
	wr.writerow(["country","USA","USA", None, None, country_map["m4m"],
		country_map["m4w"],country_map["w4m"], country_map["w4w"],
		country_common[0][0], country_common[0][1],
		country_common[1][0], country_common[1][1],
		country_common[2][0], country_common[2][1],
		country_common[3][0], country_common[3][1],
		country_common[4][0], country_common[4][1]
		])
	



if __name__ == "__main5__":
	#read_counts("data")
	#cities_map = {}
	#city_state_map = {}
	#out_map = {}
	#read_city_data("cities.csv", cities_map, city_state_map)
	#read_counts("data", cities_map, city_state_map, out_map)
	in_map = open("city-count.bin", "rb")
	city_map = pickle.load(open("city-count.bin", "rb"))
	word_map = pickle.load(open("word_map.bin", "rb"))
	csv_out = open("city_output.csv","w")
	wr = csv.writer(csv_out)
	header = ["label", "city", "state", "lon", "lat", "m4m", "m4w", "w4m", "w4w", "k1", "c1", "k2", "c2", "k3", "c3", "k4", "c4", "k5", "c5"]
	wr.writerow(header)
	for city in city_map.keys():
		if city_map[city].get("city") is not None and word_map.get(city) is not None:
			print "Processing ", city
			words_m = word_map[city]
			city_m = city_map[city]
			#pprint(words_m)
			#pprint(city_m)
			city_out = []
			city_out.append("city")
			city_out.append(city)
			try:
				city_out.append(city_m["state"])
				city_out.append(city_m["lon"])
				city_out.append(city_m["lat"])
				city_out.append(city_m.get("m4m"))
				city_out.append(city_m.get("m4w"))
				city_out.append(city_m.get("w4m"))
				city_out.append(city_m.get("w4w"))
				city_out.append(words_m["bkey1"])
				city_out.append(words_m["bcount1"])
				city_out.append(words_m["bkey2"])
				city_out.append(words_m["bcount2"])
				city_out.append(words_m["bkey3"])
				city_out.append(words_m["bcount3"])
				city_out.append(words_m["bkey4"])
				city_out.append(words_m["bcount4"])
				city_out.append(words_m["bkey5"])
				city_out.append(words_m["bcount5"])
			except KeyError, e:
				print "Skipping ",city,e
				pprint(city_m)
				pprint(word_map)
			wr.writerow(city_out)
			#break

	
if __name__ == "__main2__":
	with open("word_map.bin","rb") as word_out:
		word_map = pickle.load(word_out)
		pprint(word_map)

if __name__ == "__main1__":
	with open("city-count.bin", "rb") as in_map:
		city_map = pickle.load(in_map)
	stopwords = read_stop_words("stop.txt")
	types = [ "m4m", "m4w", "w4w", "w4m"]
	cities = city_map.keys()
	word_map = defaultdict(dict)
	#cities = ["chicago", "SF bay area", "atlanta", "baltimore", "boston", "dallas", "las vegas", "los angeles"]
	for c in cities:
		all_uni = []
		all_bi = []
		for t in types:
			#my_city = city_map[c]
			print "Processing city:", c, "type:",t
			f = "data/"+c+"-"+t+".json"
			if not isfile(f):
				print "skipping",f
				continue
			out = []
			get_unigram_array(f, stopwords, out)
			fd = FreqDist(out)
			j=1
			for i in fd.keys()[:5]:
				#print i, fd[i]
				word_map[(c,t)]["key"+str(j)] = i
				word_map[(c,t)]["count"+str(j)] = fd[i]
				j+=1
			bigram = []
			get_bigram_array(f,stopwords, bigram)
			fd1 = FreqDist(bigram)
			j=1
			for i in fd1.keys()[:5]:
				#print i, fd1[i]
				word_map[(c,t)]["bkey"+str(j)] = i
				word_map[(c,t)]["bcount"+str(j)] = fd1[i]
				j+=1
			#print ""	
			all_uni.extend(out)
			all_bi.extend(bigram)

		fd = FreqDist(all_uni)
		j=1
		for i in fd.keys()[:5]:
			#print i, fd[i]
			word_map[c]["key"+str(j)] = i
			word_map[c]["count"+str(j)] = fd[i]
			j+=1

		fd = FreqDist(all_bi)
		j=1
		for i in fd.keys()[:5]:
			#print i, fd[i]
			word_map[c]["bkey"+str(j)] = i
			word_map[c]["bcount"+str(j)] = fd[i]
			j+=1
	with open("word_map.bin","wb") as word_out:
		pickle.dump(word_map, word_out)