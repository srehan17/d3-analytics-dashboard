(function () {
  const svg = d3.select("#analytics-chart");
  const width = 520;
  const height = 320;
  const margin = { top: 35, right: 25, bottom: 65, left: 55 };

  d3.csv("assets/analytics.csv").then(data => {
    data = data.filter(d => d["Date"]);

    data.forEach(d => {
      d.date = d3.timeParse("%Y%m%d")(d["Date"]);
      d.newUsers = +d["New users"];
      d.totalUsers = +d["Total users"];
    });

    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#5f8fb8");

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#4682b4");
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.32);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.newUsers)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#e5e7eb");

    svg.select(".grid path").remove();

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .tickValues(data.map(d => d.date))
          .tickFormat(d3.timeFormat("%b %d"))
      )
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#52525b")

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#52525b");

    svg.selectAll(".domain")
      .attr("stroke", "#d4d4d8");

    svg.selectAll(".tick line")
      .attr("stroke", "#d4d4d8");

    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", height - margin.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("rx", 0)
      .attr("fill", "url(#bar-gradient)")
      .on("mouseover", function (event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("opacity", 0.75);

        tooltip
          .style("opacity", 1)
          .style("transform", "translateY(-4px)")
          .html(`
            <strong>${d3.timeFormat("%b %d")(d.date)}</strong><br>
            New users: ${d.newUsers}<br>
            Total users: ${d.totalUsers}
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 14}px`)
          .style("top", `${event.pageY - 36}px`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1);

        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 60)
      .attr("y", d => y(d.newUsers))
      .attr("height", d => height - margin.bottom - y(d.newUsers));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#000")
      .text("Portfolio traffic trend");
  });
})();