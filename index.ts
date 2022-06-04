const csv = require('csvtojson');
const csvFilePath = 'time_series_covid19_deaths_US.csv'

const getStateTotals = (data) => data.reduce((acc, current) => {
  const currentStateName = current.Province_State
  const cityPopulation = parseInt(current.Population)
  const totalCityCases = parseInt(current['4/27/21'])

  if (acc[currentStateName]) {
    acc[currentStateName].cases = acc[currentStateName].cases + totalCityCases
    acc[currentStateName].population = acc[currentStateName].population + cityPopulation
    if (acc[currentStateName].cases < acc[currentStateName].population) {
      acc[currentStateName].casesVSpopulation = (acc[currentStateName].cases / acc[currentStateName].population) * 100
    } else {
      acc[currentStateName].casesVSpopulation = 0
    }
  } else {
    if (totalCityCases < cityPopulation) {
      acc[currentStateName] = { cases: totalCityCases, population: cityPopulation, casesVSpopulation: totalCityCases / cityPopulation }
    } else {
      acc[currentStateName] = { cases: totalCityCases, population: cityPopulation, casesVSpopulation: 0 }
    }
  }

  return acc
}, {})

const getMin = (stateTotals) => Object.entries(stateTotals).reduce((acc:any, [state, stateData]:any) => {
  if (stateData.population > 0) {
    return acc.cases < stateData.cases ? acc : { state, ...stateData }
  }else{
    return acc
  }
}, {})

const getMax = (stateTotals) => Object.entries(stateTotals).reduce((acc, [state, stateData]:any) => {
  return acc.cases > stateData.cases ? acc : { state, ...stateData }
}, { cases: 0 })

const getMaxPer = (stateTotals) => Object.entries(stateTotals).reduce((acc, [state, stateData]:any) => {
  return acc.casesVSpopulation > stateData.casesVSpopulation ? acc : { state, ...stateData }
}, { casesVSpopulation: 0 })

const execute = async () => {
  const data = await csv().fromFile(csvFilePath)
  const stateTotals = getStateTotals(data)
  const min = getMin(stateTotals)
  const max = getMax(stateTotals)
  const maxPer = getMaxPer(stateTotals)

  console.log(stateTotals)
  console.log('Estado con menor acumulado a la fecha:', min.state, 'con:', min.cases, 'casos y una población de:',min.population,'habitantes')
  console.log('Estado con mayor acumulado a la fecha:', max.state, 'con:', max.cases, 'casos')
  console.log('Estado con mayor porcentaje de muertes vs total población a la fecha:', maxPer.state, 'con un', maxPer.casesVSpopulation, '%')
  console.log('A pesar de que el estado con mayor número de casos es', max.state, 
  'con', max.cases, ', se podría decir que el estado más afectado es',maxPer.state,
  ', ya que tiene mayor porcentaje de muertes vs población total.',maxPer.casesVSpopulation,'%');
}

execute()