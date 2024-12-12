// Define dimensions and margins for the chart
const margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Create an SVG element and append it to the #chart div
const svg = d3.select("#chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// NYC Open Data API endpoint for 311 Service Requests
const apiUrl = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=1000";

// Fetch data from the API
d3.json(apiUrl).then(data => {
    // Parse dates and count complaints per day
    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");
    const complaintsByDate = d3.rollups(
        data,
        v => v.length,
        d => d.created_date ? parseDate(d.created_date.split(".")[0]) : null
    ).filter(d => d[0] !== null);

    // Sort data by date
    complaintsByDate.sort((a, b) => d3.ascending(a[0], b[0]));

    // Set up scales
    const x = d3.scaleTime()
                .domain(d3.extent(complaintsByDate, d => d[0]))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(complaintsByDate, d => d[1])])
                .range([height, 0]);

    // Add X axis
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
       .call(d3.axisLeft(y));

    // Add line path
    svg.append("path")
       .datum(complaintsByDate)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 1.5)
       .attr("d", d3.line()
                    .x(d => x(d[0]))
                    .y(d => y(d[1]))
       );

    // Add points
    svg.selectAll("circle")
       .data(complaintsByDate)
       .enter()
       .append("circle")
       .attr("cx", d => x(d[0]))
       .attr("cy", d => y(d[1]))
       .attr("r", 3)
       .attr("fill", "red")
       .on("mouseover", (event, d) => {
           const [xPos, yPos] = d3.pointer(event);
           tooltip.style("left", `${xPos + margin.left}px`)
                  .style("top", `${yPos + margin.top}px`)
                  .style("display", "inline-block")
                  .html(`Date: ${d3.timeFormat("%B %d, %Y")(d[0])}<br>Complaints: ${d[1]}`);
       })
       .on("mouseout", () => tooltip.style("display", "none"));

    // Tooltip
    const tooltip = d3.select("body")
                      .append("div")
                      .attr("class", "tooltip");
}).catch(error => {
    console.error("Error fetching data:", error);
});
