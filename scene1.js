function drawScene1(data) {

    // Remove all existing elements smoothly
    svg.selectAll("*").transition().duration(500).style("opacity", 0).remove();

    // Setup event listeners to pass the loaded data      
    d3.select("#btn_left").style("visibility","hidden");
    d3.select("#btn_right")
        .style("visibility","visible")
        .on("click", () => drawScene2(data));

    // Group data by month and sum the values
    var groupedByMonth = d3.group(data, d => d3.timeMonth.floor(d.event_date));
    var monthlyData = Array.from(groupedByMonth, ([key, value]) => ({
        date: key,
        pe_count: value.length // Count of events in this month
    }));

    // Add X axis --> it is a date format
    const x = d3.scaleTime()
        // .domain(d3.extent(data, d => d.event_date))
        .domain([d3.min(data, d => d.event_date), new Date(2017, 0, 1)])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));   

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(monthlyData, d => d.pe_count)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("# events");

    // Add the area
    svg.append("path")
        .datum(monthlyData)
        // .attr("fill", "#cce5df")
        .attr("fill", "none")
        .attr("stroke", "#003f5c")
        .attr("stroke-width", 2)
        .attr("d", d3.area()
            .x(d => x(d.date))
            .y0(y(0))
            .y1(d => y(d.pe_count))
        )

    // Define the annotation
    const scene1_annotations = [
        {
            note: {
                title: "60 Minutes",
                label: "Two USAF F-22 pilots speak out about unexplained physiological episodes",
                wrap: 150 // ensures the text fits within a specified width
            },
            // X and Y coordinates computed from data
            x: x(new Date("2012-05-01")),
            y: y(8.2),
            dy: -100, // adjust the position of the text relative to the line
            dx: -10  // adjust the position of the text relative to the line
        },
        {
            note: {
                title: "Navy Orders Comprehensive Review",
                label: "Adm. Scott Swift's (Commander, U.S. Pacific Fleet) begins comprehensive review of the facts, circumstances and processes surrounding physiological episodes",
                wrap: 300 // ensures the text fits within a specified width
            },
            // X and Y coordinates computed from data
            x: x(new Date("2017-02-01")),
            y: y(28),
            dy: 70, // adjust the position of the text relative to the line
            dx: -160  // adjust the position of the text relative to the line
        }

    ];

    // Add annotation to the chart
    const makeScene1Annotations = d3.annotation().annotations(scene1_annotations);
    svg.append("g")
        .call(makeScene1Annotations);

};
