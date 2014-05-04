
$(document).ready(function() {

w = $("div.chart").width()
h = 440;
break1 = 575;
break2 = 400;

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
	
	//Create Data Structure from CSV
	var dataset = [];
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
		dataset.push(data);
	});

	colors = makeColorScheme()
	purple = d3.rgb('#501F84');

	//Search 
	$('div.chart').before("<div class='search'></div>");
	if (isMobile == false) {
		$('div.search').append('<select data-placeholder="Search for your major and compare it to others."' +
								'class="chosen-select" multiple="true"></select></div>');
		select = $('select.chosen-select');
		select.chosen({
			width: '100%',
			max_selected_options: 10,
			no_results_text: "Oops, nothing found!",
		});
		mkSearch(dataset);
	} else {
		$('div.search').append('<p class="mobile_explain"></p>');
		$('p.mobile_explain').text("This graph is best viewed on a desktop so you can search for and compare majors.");
	}

	//Set up SVG
	var margin = {top: 40, right: 30, bottom: 30, left: 30},
	    width = w - margin.left - margin.right,
	    height = h - margin.top - margin.bottom;

	var svg = d3.select("div.chart").append("svg")
	   	.attr("class", "main_chart")
		
	var chart = d3.select("svg.main_chart").append("g")
		.classed({'chart': true})

	//Line Stuff
	var x = d3.time.scale()
	    .range([0, width]);
	
	var y = d3.scale.linear()
		.rangeRound([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
		.interpolate('monotone')
	    .x(function(d) { return x(d[0]); })
	    .y(function(d) { return y(d[1]); })
	    .defined(function(d) { return !isNaN(d[1]); });

	//Bar Stuff
	var barMargin = {top: 30, right: 5, bottom: 10, left: 5},
	    barChartWidth = w - barMargin.left - barMargin.right,
	    barWidth = w - barMargin.right;

	var barPaddingTop = 1;
	var barHeight = 20;
	var percent = d3.format('%');

	var b = d3.scale.linear()
	    .range([0, barChartWidth]);

	var barAxis = d3.svg.axis()
		.scale(b)
		.orient('top');

	function latestValue(d) {
    	return d.values[d.values.length - 1][1];
	};

	var param = {
		upperDomain: getUpperDomain(dataset),
		activeItemsExist: false
	};

	if (width > break2) {
		chart.attr('data-charttype', 'line')
		drawChart(dataset);
		$('p.instructions.line').show();
		$('p.instructions.bar').hide();
	} else {
		$('div.search').hide();
		chart.attr('data-charttype', 'bar')
		drawBarGraph(dataset)
		$('p.instructions.line').hide();
		$('p.instructions.bar').show();
	}

	$('p.metainfo').css("display", "inline");

	function drawChart(dataset) {
		
		svg
			.attr("width", width + margin.left + margin.right)
	    	.attr("height", height + margin.top + margin.bottom)

		chart
			.attr('class', 'chart inactive')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

		if (width < break1) {
			x.domain([new Date(2007, 0, 1), new Date(2013, 0, 1)]);
		} else {
			x.domain([new Date(2003, 0, 1), new Date(2013, 0, 1)]);
		}

		y.domain([0, getUpperDomain(dataset)]);

		chart.append("clipPath")
		    .attr("id", "chart-area")         
		    .append("rect")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("fill", "grey");

		var majors = chart.selectAll(".major")
			.data(dataset)
			.enter()
			.append("g")
			.attr("class", "major")
			.attr("data-major", function(d) {return d.major;})
			.attr("data-school", function(d) {return d.school;})
			.on('click', function(d, i) {
				option = $('option[value="' + d.major + '"]');
				if (selectedMajors.items.indexOf(d.major) < 0) {
					selectedMajors.update( {selected: d.major} );
					option.prop('selected', true);
				} else {
					selectedMajors.update( {deselected: d.major} );	
					option.prop('selected', false);
				}
				select.trigger('chosen:updated');
		    	updateDataset(dataset);
			})
			.on('mouseover', function(d) {
				majors.append("text")
					.attr("class", "tooltip")
					//.attr("fill", "black")
					.text(d.major)
					.attr("text-anchor", "end")
					.attr("x", width);
			})
			.on('mouseout', function(d) {
				majors.select(".tooltip").remove();
			});

		var path = majors.append("path")
			.attr("class", "line")
			.attr("d", function(d) { return line(d.values); })
			.attr("clip-path", "url(#chart-area)")
			.attr("stroke", function(d) { return purple })
			.attr("opacity", .5)
			.attr("stroke-width", 1.2)

		var point = majors.append("g")
			.attr("class", "line-points")
			.attr("display", "none")
			.attr('fill', purple)
			.attr("opacity", 0);

		var circle = point.selectAll('circle')
			.data(function(d){return d.values})
			.enter()
			.append('circle')
			.attr("cx", function(d) { return x(d[0]) })
			.attr("cy", function(d) { return y(d[1]) })
			.attr("r", 2.5)

		chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		chart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Degrees");
	}

	function updateChart(dataset) {

		function major(d) {
			return d.major;
		}

		var duration = 200;
		var ease = 'linear';

		var t = chart.transition()
			.duration(duration)
			.attr("class", function(d){
				if (param.activeItemsExist) {
					return 'chart active';
				} else {
					return 'chart inactive';
				}
			})
			.ease(ease);
		
		y.domain([0,param.upperDomain]);
		t.select(".y.axis").call(yAxis);

		var majors = chart.selectAll(".major")
			.data(dataset, major)
			.order();

		majors.transition()
			.duration(duration)
			.ease(ease)
			.attr("class", function(d) {
				if (param && !param.activeItemsExist) {
					return 'major';
				} else if (d.active==true) {
					return 'major active';
				} else {
					return 'major inactive';
				}
			})

		var path = majors.selectAll("path")
			.order()

		path.transition()
			.duration(duration)
			.ease(ease)
			.attr("d", function(d) { return line(d.values); })
			.attr("stroke", function(d) { 
				if (d.color) { 
					return d.color;
				} else {
					return purple;
				}
			})
			.attr("stroke-width", function(d) { 
				if (d.color) { 
					return 2.5;
				} else {
					return 1.2;
				}
			})
			.attr("opacity", function(d) { 
				if (param && !param.activeItemsExist) {
					return .5;
				} else if (d.active) { 
					return 1;
				} else {
					return 0.1;
				}
			});

		var point = majors.selectAll('.line-points');
		point.transition()
			.duration(duration)
			.ease(ease)
			.attr("display", function(d) {
				if (d.active) { 
					return 'inline';
				} else {
					return 'none';
				}

			})
			.attr("fill", function(d) { 
				if (d.color) { 
					return d.color;
				} else {
					return purple;
				}
			})
			.attr("opacity", function(d) { 
				if (d.active) { 
					return 1;
				} else {
					return 0;
				}
			})
			.attr("r", function(d) {
				if (d.active) {
					return 5;
				} else {
					return 2.5;
				}
			});

		var circle = point.selectAll('circle')
			.data(function(d){return d.values})

		circle.transition()
    		.duration(duration)
    		.ease(ease)
			.attr("cx", function(d) { return x(d[0]) })
			.attr("cy", function(d) { return y(d[1]) })


		$('.search-choice').each(function(item) {
			text = $(this).text();
			for (var i = dataset.length - 1; i >= 0; i--) {
				color = d3.rgb(dataset[i].color);
				if (dataset[i].major == text) {
					$( this ).css({
						"background-color": color,
						"color": color.brighter(4)
					});
				}
			};
		});
	}

	function drawBarGraph(dataset) {
		
		svg
			.attr("width", barChartWidth + 10)
	    	.attr("height", ((barHeight + barPaddingTop) * numCases(dataset)) + barMargin.top + barMargin.bottom)

		chart
			.data(dataset)
			.attr('width', barWidth)
			.attr('height', ((barHeight + barPaddingTop) * numCases(dataset)))
			.attr('class', 'chart')
			.attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");
		
		b.domain([0, getUpperDomainForLatestYear(dataset)]);
		
		chart.append("g")
			.attr("class", "b axis")
			.call(barAxis)
			// .append("text")
			// 	.attr("transform", "rotate(0)")
			// 	.attr("y", 6)
			// 	.attr("dy", ".71em")
			// 	.text("Degrees Awarded in 2013");


		chart.data(dataset)
			.attr('width', width)
			.attr('height', '');


		var majors = chart.selectAll(".major")
			.data(dataset)
			.enter()
			.append("g")
			.filter(function(d) { return (latestValue(d) != 0) })
			.sort(function(a, b) {
				return d3.descending(latestValue(a), latestValue(b));
			})
			.attr("class", "major")
			.attr("data-major", function(d) {return d.major;})
			.attr("data-school", function(d) {return d.school;})
			.attr("transform", function(d, i) { return "translate(0," + i * (barHeight+barPaddingTop) + ")"; });

		var bground = majors.append('rect')
			.attr('class', 'bground')
			.attr('width', barWidth)
			.attr('height', barHeight)
			.attr('fill', 'white');

		var bar = majors.append('rect')
			.attr('class', 'bar')
			.attr('width', function(d) { return b(latestValue(d)); })
			.attr('height', barHeight)
			.attr('fill', 'purple')
			.attr('opacity', 0.4);

		var text = majors.append('text')
			.attr('class', 'name')
			.attr("x", function(d) { return (barWidth - 10) - 5; })
			.attr("y", barHeight / 2)
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("fill", 'black')
			.attr("font-weight", "bold")
			.text(function(d) { return d.major; });

		var number = majors.append('text')
			.attr('class', 'number')
			.attr("x", function(d) { return 5; })
			.attr("y", barHeight / 2)
			.attr("dy", ".35em")
			.attr("fill", 'black')
			.attr("font-weight", "normal")
			.text(function(d) { return latestValue(d); });

		majors
			.on('mouseover', function(d) {
				var m = d3.select('g[data-major="' + d.major + '"] rect.bar');
				var n = d3.select('g[data-major="' + d.major + '"] rect.bground');
				m.attr('opacity', 0.6);
				n.attr('opacity', 0.3);
			})
			.on('mouseout', function(d) {
				var m = d3.select('g[data-major="' + d.major + '"] rect.bar');
				var n = d3.select('g[data-major="' + d.major + '"] rect.bground');
				m.attr('opacity', 0.4);
				n.attr('opacity', 1);
			});

	}

	function updateBarGraph(dataset) {

		function major(d) {
			return d.major;
		}

		var duration = 0;
		var ease = 'linear';

		var t = chart.transition()
			.duration(duration)
			.ease(ease);

	  	b.range([0, barChartWidth]);

		t.select(".b.axis").call(barAxis);

		var majors = chart.selectAll(".major")
			.data(dataset);

		majors.transition()
			.duration(duration)
			.ease(ease);

		var bground = majors.selectAll('.bground')
			.attr('class', 'bground');
		bground.transition()
			.duration(duration)
			.ease(ease)
			.attr('width', barWidth);

		var bar = majors.selectAll('.bar');
		bar.transition()
			.duration(duration)
			.ease(ease)
			.attr('class', 'bar')
			.attr('width', function(d) { return b(latestValue(d)); });

		var text = majors.selectAll('text.name');
		text.transition()
			.duration(duration)
			.ease(ease)
			.attr('class', 'name')
			.attr("x", function(d) { return (barWidth - 10) - 5; })
			.attr("y", barHeight / 2);

		var number = majors.selectAll('text.number');
		number.transition()
			.duration(duration)
			.ease(ease)
			.attr('class', 'number')
			.attr("x", function(d) { return 5; })
			.attr("y", barHeight / 2)
			.text(function(d) { return latestValue(d); });


	}

	$( window ).resize( function() {
		wid = $("div.chart").width()
		width = wid - margin.left - margin.right;
		barChartWidth = wid - barMargin.left - barMargin.right;
	    barWidth = wid - barMargin.right;

		var charttype = chart.attr('data-charttype');
		if (width > break2 && !isMobile) {

			$('div.search').show();
			$('p.instructions.line').show();
			$('p.instructions.bar').hide();

			if (width < break1) {
				x.domain([new Date(2007, 0, 1), new Date(2013, 0, 1)]);
			} else {
				x.domain([new Date(2003, 0, 1), new Date(2013, 0, 1)]);
			}
			x.range([0, width]);
			d3.select(".x.axis").call(xAxis);

			d3.select('svg.main_chart')
				.attr("width", width + margin.left + margin.right)

			d3.select("#chart-area")
				.select("rect")
				.attr("width", width)

			if (charttype == 'bar') {
				chart.selectAll('*').remove();
				chart.attr('data-charttype', 'line');
				drawChart(dataset);
			} else {
				updateChart(dataset);
			}

		} else {

			$('div.search').hide();
			$('p.instructions.line').hide();
			$('p.instructions.bar').show();

			svg
				.attr("width", barChartWidth + 10)
		    	.attr("height", ((barHeight + barPaddingTop) * numCases(dataset)) + barMargin.top + barMargin.bottom)

			if (charttype == 'line') {
				chart.selectAll('*').remove();
				chart.attr('data-charttype', 'bar');
				drawBarGraph(dataset);
			} else {
				updateBarGraph(dataset)	
			}
		}
	});

	function SelectedMajors() { 
		this.items = []; 
	}

	SelectedMajors.prototype.update = function(item) {
		if (item.selected){
			this.items.push(item.selected);
		}
		if (item.deselected) {
			var index = this.items.indexOf(item.deselected);
			this.items.splice(index, 1);
		}
	}

	var selectedMajors = new SelectedMajors();

	function mkSearch(dataset) {
		var list = d3.nest()
		    .key(function(d) { return d.school; })
		    .entries(dataset);

		var output = [];
		var filter = [];

		for (var a = 0; a < list.length; a++) {

			var school = list[a].key;
			var school = schoolCodeToName(school);
			var optgroup = "<optgroup label='" + school + "'>";
			output.push(optgroup);

			for (var b = 0; b < list[a].values.length; b++) {
				major = list[a].values[b].major;
				option = "<option value='"+ major +"'>" + major + "</option>";
				output.push(option);
			};
			output.push('</optgroup>');
		};
		
		select.html(output.join(''));
		select.trigger('chosen:updated');
		select.on('change', function(evt, param) {
			selectedMajors.update(param);
	    	updateDataset(dataset)
	  	});	
	};

	function updateDataset(d) {
		activeItems = [];
		for (var i = d.length - 1; i >= 0; i--) {
			major = d[i].major;
			itemInFilter = selectedMajors.items.indexOf(major);
			if (itemInFilter >= 0) {
				d[i].active = true;
				activeItems.push(d[i]);
			} else {
				d[i].active = false;
			}
		}

		if (activeItems.length == 0) {
			param.activeItemsExist = false;
			param.upperDomain = getUpperDomain(dataset);
		} else {
			param.activeItemsExist = true;
			param.upperDomain = getUpperDomain(activeItems);
		}

		d.sort(function(x,y) {
			//http://stackoverflow.com/a/17387454
			a = x.active;
			b = y.active;
			if (a === b) {
				return 0;
			} else {
				if (a == true) {
					return 1;
				} else {
					return -1;
				}
			}
		});

		selectedMajors.paramaters = param;
		dataset = updateColors(d)
		updateChart(dataset);
	}

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

	function updateColors(dataset) {

		for (var i = 0; i < dataset.length; i++) {
			if (dataset[i].active && dataset[i].color) {
				dataset[i].color = dataset[i].color;
			} else if (!dataset[i].active && dataset[i].color) {
				resetColor(dataset[i].color);
				dataset[i].color = false;
			} else if (dataset[i].active && !dataset[i].color) {
				color = nextAvailableColor();
				dataset[i].color = color.color;
				color.active = true;
			} else {
				dataset[i].color = false;
			}
		};

		function resetColor(color) {
			for (var a = 0; a < colors.length; a++) {
				if (colors[a].color == color) {
					colors[a].active = false;
				};
			}
		}

		function nextAvailableColor() {
			for (var a = 0; a < colors.length; a++) {
				if (colors[a].active == false) {
					return colors[a];
				}
			};
		}
		return dataset;
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

	function getUpperDomainForLatestYear(dataset) {
		yValues = [];
		for (var i = dataset.length - 1; i >= 0; i--) {
			var l = dataset[i].values.length;
			yValues.push(dataset[i].values[l-1][1]);
		};
		max = d3.max(yValues);
		return max;
	}

	function numCases(dataset) {
		cases = [];
		for (var i = dataset.length - 1; i >= 0; i--) {
			v = latestValue(dataset[i])
			if (v != 0) {
				cases.push(dataset[i])
			}
		}
		return cases.length
	}

	function schoolCodeToName(school) {
		switch(school) {
			case "02SES": return "School of Education and Social Policy"; break;
			case "03JOU": return "Medill School of Journalism"; break;
			case "04CAS": return "Weinberg College of Arts and Sciences"; break;
			case "05MUS": return "Bienen School of Music"; break;
			case "06SPC": return "School of Communication"; break;
			case "07MEA": return "McCormick School of Engineering"; break;
		}
	}

});

});