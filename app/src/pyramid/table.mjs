import { getData } from './state.mjs';

// This function gets the data (and totals) information from the
// computed year object and then bins that data. This can then be
// used in the assosciated table and dependency ratio calculations
function getTableData() {
  const bins = [
    { name: '<18' , accept: d => d.age < 18, count: 0 },
    { name: '18—64' , accept: d => d.age > 18 && d.age < 65, count: 0 },
    { name: '65+' , accept: d => d.age >= 65, count: 0 },
  ];

  const { data, totals } = getData('year');

  data.forEach(function(d) {
    for (const bin of bins) {
      if (bin.accept(d)) {
        bin.count += (d.f + d.m);
        break;
      }
    }
  });
  
  const total = totals.f + totals.m;

  bins.forEach(d => d.pct = (d.count / total) * 100);

  return { bins, total };
}


export { getTableData };
