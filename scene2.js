function drawScene2(data) {

    // Remove all existing elements smoothly
    svg.selectAll("*").transition().duration(500).style("opacity", 0).remove();

    // Setup event listeners to pass the loaded data      
    d3.select("#btn_left")
        .style("visibility","visible")
        .on("click", () => drawScene1(data));
    d3.select("#btn_right")
        .style("visibility","visible")
        .on("click", () => drawScene3(data));


    // Group by month first
    var groupedByMonth = d3.groups(data, d => d3.timeMonth.floor(d.event_date));

    var monthlyData = Array.from(groupedByMonth, ([key, value]) => ({
        date: key,
        pe_count: value.length // Count of events in this month
    }));

    // // Stack the data: each group will be represented on top of each other
    var mygroups = ["HAZREP", "E", "D", "C", "B", "A", "NA"].reverse(); // list of group names (reversed)

    // Initialize an empty object to store the results
    processedData = {};

    groupedByMonth.forEach(([month, records]) => {
        // Initialize the month object if it does not already exist
        if (!processedData[month]) {
            processedData[month] = {};
        }

        mygroups.forEach(grp => {
            processedData[month][grp] = 0;
        });

        records.forEach(record => {
            const peClass = record.pe_class || "NA"; // Handle empty or undefined pe_class
            // Initialize the pe_class count if it does not already exist
            if (!processedData[month][peClass]) {
                processedData[month][peClass] = 0;
            }
            // Increment the count for this pe_class
            processedData[month][peClass] += 1;
        });

    });

    // Convert to Array
    let processedArray = [];

    Object.keys(processedData).forEach(month => {
        Object.keys(processedData[month]).forEach(peClass => {
            // console.log("month:", month, typeof(month));
            processedArray.push({
                pe_month: Date.parse(month),
                pe_class: peClass,
                pe_count: processedData[month][peClass]
            });
        });
    });

    const series = d3.stack()
        .keys(mygroups)
        .value(([, group], key) => {
            const item = group.get(key);
            return item.pe_count;
        })
        (d3.index(processedArray, d => d.pe_month, d => d.pe_class));

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

    // Color scale
    var customColorScheme = [
        "#9f9f9f", //grey
        "#dd5182", //pink
        "#955196", //purple
        "#444e86", //deep fuschia
        "#ff6e54", //orange
        "#ffa600", //yellow
        "#003f5c", //deep aqua
    ];
    const color = d3.scaleOrdinal(mygroups, customColorScheme);  // Or any other appropriate color scheme

    svg.selectAll(".layer")
        .data(series)
        .enter().append("path")
        .style("fill", function (d) {
            return color(d.key); })
            // d.key is automatically attached to each layer by the d3.stack() function.  
            // It derives from the keys you pass to .keys() method of the stack generator.  
            // It’s used to access or refer to the specific subset of data (like a category or group) 
            // represented by that layer in further operations, such as styling or interaction.
        .attr("stroke", "grey")
        .attr("stroke-width", 1.5)
        .attr("d", d3.area()
            .x(function (d) { 
                return x(d.data[0]); })  // Assuming 'date' is the x-value for each data point
            .y0(function (d) { 
                return y(d[0]); })       // d[0] is the lower bound of the area (stack bottom)
            .y1(function (d) { 
                return y(d[1]); })      // d[1] is the upper bound of the area (stack top)
        )

      // Features of the annotation
      const annotations = [
        {
          note: {
            label: "Here is the annotation label",
            title: "Annotation title"
          },
          x: 100,
          y: 0,
          dy: 100,
          dx: 100
        }
      ]

      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        .annotations(annotations)
      d3.select("#example1")
        .append("g")
        .call(makeAnnotations)

    // Legend
    svg.append("text").attr("x", 50).attr("y", 30).text("Mishap Category").style("font-size", "18px").attr("alignment-baseline","middle")
    svg.append("circle").attr("cx",50).attr("cy",60).attr("r", 6).style("fill", "#9f9f9f")
    svg.append("circle").attr("cx",50).attr("cy",80).attr("r", 6).style("fill", "#dd5182")
    svg.append("circle").attr("cx",50).attr("cy",100).attr("r", 6).style("fill", "#955196")
    svg.append("circle").attr("cx",50).attr("cy",120).attr("r", 6).style("fill", "#444e86")
    svg.append("circle").attr("cx",50).attr("cy",140).attr("r", 6).style("fill", "#ff6e54")
    svg.append("circle").attr("cx",50).attr("cy",160).attr("r", 6).style("fill", "#ffa600")
    svg.append("circle").attr("cx",50).attr("cy",180).attr("r", 6).style("fill", "#003f5c")
    svg.append("text").attr("x", 70).attr("y", 60).text("NA/Unknown").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 80).text("A").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 100).text("B").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 120).text("C").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 140).text("D").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 160).text("E").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 70).attr("y", 180).text("HAZREP").style("font-size", "15px").attr("alignment-baseline","middle")


    // Define the annotation
    const scene2_annotations = [
        {
            note: {
                title: "Reporting Severity Increases",
                label: "Class D mishaps on the rise, indicating recordable injury",
                wrap: 250 // ensures the text fits within a specified width
            },
            // X and Y coordinates computed from data
            x: x(new Date("2015-02-01")),
            y: y(2.2),
            dy: -300, // adjust the position of the text relative to the line
            dx: -50  // adjust the position of the text relative to the line
        }
    ];

    // Add annotation to the chart
    const makeScene2Annotations = d3.annotation().annotations(scene2_annotations);
    svg.append("g").call(makeScene2Annotations);

};
