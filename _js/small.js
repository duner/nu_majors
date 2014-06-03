$(document).ready(function() {

//ALL THE D3 STUFF//

w = $("div.main_chart").width()
h = 440;
break1 = 575;
break2 = 388;

smallW = $("div.major div.article div.small_chart").width()
smallH = $("div.major div.article div.small_chart").height()


if (navigator.userAgent.match(/iPhone/i) ||
	navigator.userAgent.match(/iPad/i)	||
	navigator.userAgent.match(/iPod/i) ||
	navigator.userAgent.match(/Android/i) ||
	navigator.userAgent.match(/IEMobile/i)) {
	var isMobile = true;
} else {
	var isMobile = false;
}

d3.csv("_data/Undergrad_Degrees_012814.csv", function(csv) {

	var DATASET = [];
	csv.forEach(function(d) {
		var data = {
			school: d.school,
			major: d.major,
			active: false,
			color: false,
			values: []
		}
		for (var i = 2003; i <= 2013; i++) {
			a = i.toString();
			year = new Date(a, 0, 1);
			degree_count = +d[parseInt(a)];
			data.values.push([year, degree_count]);
		}
		DATASET.push(data);
	});

	var dataset = DATASET;

	colors = makeColorScheme()
	purple = d3.rgb('#501F84');
	smallDate = d3.time.format("'%y");
	fullDate = d3.time.format("%Y");

	var smallMargin = {top: 10, right: 30, bottom: 30, left: 30};
    var smallWidth = smallW - smallMargin.left - smallMargin.right;
    var smallHeight = smallH - smallMargin.top - smallMargin.bottom;
	var smX = d3.time.scale()
	    .range([0, smallWidth])
	   	.domain([new Date(2003, 0, 1), new Date(2013, 0, 1)]);
	var smY = d3.scale.linear()
		.rangeRound([smallHeight, 0]);
	var smXAxis = d3.svg.axis()
	    .scale(smX)
	    .orient("bottom");
	var smYAxis = d3.svg.axis()
	    .scale(smY)
	    .orient("left");
	var smLine = d3.svg.line()
		.interpolate('monotone')
	    .x(function(d) { return smX(d[0]); })
	    .y(function(d) { return smY(d[1]); })
	    .defined(function(d) { return !isNaN(d[1]); });
	

	createSmallGraphs(dataset)

	function createSmallGraphs(dataset) {

		articles = d3.selectAll("div.article").each(function(d, i) {
			self = this;
			var colorsArray = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];

			m = d3.select(this).attr('data-major');

			a = addChartsToDataset(dataset);

			var n = [];
			if (m == "Computer") {
				for (var i = a.length - 1; i >= 0; i--) {
					computer = a[i].major.indexOf("Computer");
					if (computer >= 0 || a[i].major.indexOf("Electrical") >= 0) {
						n.push(a[i].major);
					}
					smX.domain([new Date(2003, 0, 1), new Date(2014, 0, 1)]);

				};
			} else {
				n = m.split(",")
			}
			small_dataset = [];

			for (var i = a.length - 1; i >= 0; i--) {
				index = n.indexOf(a[i].major);
				if (index >= 0) {
					small_dataset.push(a[i]);
				}
			}
			
			for (var i = 0; i <= small_dataset.length - 1; i++) {
				if (small_dataset.length > 1) {
					small_dataset[i].color = colorsArray[i];
				} else {
					small_dataset[i].color = purple;
				}				
			}

			//console.log('a');


			smX.range([0, smallWidth]);
			smY.rangeRound([smallHeight, 0]);

			a = getUpperDomain(small_dataset);
			smY.domain([0,a]);

			svg = d3.select(this).selectAll("div.small_chart").append('svg')			
				.attr("width", smallWidth + smallMargin.left + smallMargin.right)
		    	.attr("height", smallHeight + smallMargin.top + smallMargin.bottom);

		    small_chart = svg.append('g')
				.attr('class', 'small_chart')
				.attr("transform", "translate(" + smallMargin.left + "," + smallMargin.top + ")")

			small_chart.append("clipPath")
			    .attr("id", "chartarea")         
			    .append("rect")
			    .attr("width", smallWidth)
			    .attr("height", smallHeight)
			    .attr("fill", "grey");

			var majors = small_chart.selectAll(".major")
				.data(small_dataset)
				.enter()
				.append("g")
				.sort(function(a, b) {
					return d3.descending(a.major, b.major);
				})
				.attr("class", "major")
				.attr("data-major", function(d) {return d.major;})
				.attr("data-school", function(d) {return d.school;})

			var path = majors.append("path")
				.attr("class", "line")
				.attr("d", function(d) { return smLine(d.values); })
				.attr("clip-path", "url(#chartarea)")
				.attr("stroke", function(d) { return d.color })
				.attr("fill", "none")
				.attr("stroke-width", 1.2)

			var point = majors.append("g")
				.attr("class", "line-points")
				.attr('fill', function(d) { return d.color });

			var circle = point.selectAll('circle')
				.data(function(d){return d.values})
				.enter()
				.append('circle')
				.attr("cx", function(d) { return smX(d[0]) })
				.attr("cy", function(d) { return smY(d[1]) })
				.attr("r", 2.5)

			if (smallW < 375) {
				smXAxis.tickFormat(smallDate);
			} else {
				smXAxis.tickFormat(fullDate);
			}


			small_chart.append("g")
				.attr("class", "smX axis")
				.attr("transform", "translate(0," + smallHeight + ")")
				.call(smXAxis);

			small_chart.append("g")
				.attr("class", "smY axis")
				.call(smYAxis)
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Degrees Awarded");

			//Create Key
			if (small_dataset.length > 1) {

				key = d3.select(this).select('div.articlechart').append('div')
					.attr('class', 'key');

				for (var i = 0; i <= small_dataset.length - 1; i++) {

					var item = key.selectAll(".item")
						.data(small_dataset)
						.enter()
						.append("div")
						.attr("class", "item")

					box = item.append('div')
						.attr('class', 'box')
						.style('background-color', function(d) { return d.color; });

					p = item.append('p')
						.text(function(d) { return d.major; });

				}
			}
		});
	}


	$( window ).resize(function() {

	    smallW = $("div.article div.small_chart").width();
		smallH = $("div.article div.small_chart").height();
		smallWidth = smallW - smallMargin.right - smallMargin.left; 
		smallHeight = smallH - smallMargin.top - smallMargin.bottom

		smCh = d3.selectAll('div.small_chart')
		smCh.selectAll("*").remove()
		smKey = d3.selectAll('div.key')
		smKey.remove()
		createSmallGraphs(dataset)
	});

	function makeColorScheme() {

		var colors = [];
		var colorArray = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

		for (var i = 0; i < colorArray.length; i++) {
			var obj = {
				color: colorArray[i],
				active: false,
			}
			colors.push(obj)
		};

		return colors;
	}

	function getUpperDomain(dataset) {
		yValues = [];
		for (var i = dataset.length - 1; i >= 0; i--) {
			for (var j = dataset[i].values.length - 1; j >= 0; j--) {
					yValues.push(dataset[i].values[j][1]);
			};
		};
		max = d3.max(yValues);
		return max + (max/15);
	}

	function addChartsToDataset(d) {
		for (var i = d.length - 1; i >= 0; i--) {
			if (d[i].major == "Computer Science") {
				d[i].major = "Computer Science (Degrees Awarded)"
				data = {
					major: 'Computer Science (Declared Majors)',
					values: [
						[new Date(2008, 0, 1), 61],
						[new Date(2009, 0, 1), 78],
						[new Date(2010, 0, 1), 91],
						[new Date(2011, 0, 1), 83],
						[new Date(2012, 0, 1), 109],
						[new Date(2013, 0, 1), 156],
						[new Date(2014, 0, 1), 192],
					]		
				}
				d.push(data);
			}
			if (d[i].major == "Computer Engineering") {
				d[i].major = "Computer Engineering (Degrees Awarded)"
				data = {
					major: 'Computer Engineering (Declared Majors)',
					values: [
						[new Date(2008, 0, 1), 55],
						[new Date(2009, 0, 1), 55],
						[new Date(2010, 0, 1), 55],
						[new Date(2011, 0, 1), 49],
						[new Date(2012, 0, 1), 42],
						[new Date(2013, 0, 1), 65],
						[new Date(2014, 0, 1), 83],
					]		
				}
				d.push(data);
			}
		};
		return d;
	}

});
});

