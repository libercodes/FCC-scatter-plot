const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
}

const svgHeight = 400 - margin.top - margin.bottom
const svgWidth = 500 - margin.left - margin.right
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
const translateX = 50

const color = d3.scaleOrdinal(d3.schemeCategory10);

let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

const fetchData = async() => {
    const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
    const data = await response.json()
    console.log(data)
    return data;
}

fetchData()
    .then(list => {
        list.forEach(function(d) {
            d.Place = +d.Place;
            var parsedTime = d.Time.split(':');
            d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
        });
        
        const svg = d3.select('.scatterplot')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
        
        //Escala en x
        const xScale = d3.scaleLinear()
            .range([0, svgWidth])
            .domain([d3.min(list, d => d.Year - 1), d3.max(list, d => d.Year + 1)])
        //Eje x
        const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format('d'))
        
        //Escala en y
        const yScale = d3.scaleTime()
            .range([svgHeight-30, 0])
            .domain(d3.extent(list, d => d.Time))
        
        //Eje y
        const timeFormat = d3.timeFormat("%M:%S");
        const yAxis  = d3.axisLeft().scale(yScale).tickFormat(timeFormat)
        
        const valueline = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d.Time))
        
        //Renderiza el eje x
        svg.append('g')
            .attr('transform', `translate(${translateX},${svgHeight-20})`)
            .call(xAxis)
        
        //Renderiza el eje y
        svg.append('g')
            .attr('transform', `translate(${translateX},10)`)
            .call(yAxis)
        
        
        svg.selectAll('dot') //Selecciona todos los elementos circle
            .data(list) //Carga el dataset
            .enter() // Realiza un mapeo del dataset
            .append('circle') // agrega un circulo por cada elemento del dataset
            .attr('cx', d => translateX + xScale(d.Year)) //establece la coordenada en x del centro del circulo
            .attr('data-xvalue', d => d.Year)
            .attr('data-yvalue', d => d.Time.toISOString())
            .attr('cy', d => 10+ yScale(d.Time)) //establece la coordenada en y del centro del circulo
            .attr('r', 6)  // establece el radio del circulo 
            .style('fill', d => color(d.Doping != ""))
            .on('mouseover', d => {
                tooltip.style('opacity', .9)
                tooltip.attr('data-year', d.Year)
                tooltip.html(`
                    ${d.Name}: ${d.Nationality} <br/> ${d.Doping? `<br/> ${d.Doping}` : ''}
                `)
                .style('left', `${d3.event.pageX}px`)
                .style('top', `${d3.event.pageY - 28}px`)
            })
            .on('mouseout', d => tooltip.style('opacity', 0))

    })