const margin = { top: 50, right: 30, bottom: 50, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

const apiUrl = "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=1000";

d3.json(apiUrl).then(data => {
    console.log("Data fetched:", data); // Debugging

    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");
    const complaintsByDate = d3.rollups(
        data,
        v => v.length,
        d => d.created_date ? parseDate(d.created_date.split(".")[0]) : null
    ).filter(d => d[0] !== null);

    console.log("Processed Data:", complaintsByDate); // Debugging

    const x = d3.scaleTime()
                .domain(d3.extent(complaintsByDate, d => d[0]))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(complaintsByDate, d => d[1])])
                .range([height, 0]);

    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

    svg.append("g")
       .call(d3.axisLeft(y));

    svg.append("path")
       .datum(complaintsByDate)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 1.5)
       .attr("d", d3.line()
                    .x(d => x(d[0]))
                    .y(d => y(d[1]))
       );

}).catch(error => {
    console.error("Error fetching data:", error);
});
