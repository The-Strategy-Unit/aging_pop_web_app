import { getData } from './state.mjs';


function getTableData() {
  const bins = [
    { name: '<18' , accept: d => d.under <= 18, count: 0 },
    { name: '18—64' , accept: d => d.under > 18 && d.under <= 65, count: 0 },
    { name: '65+' , accept: d => d.under > 65, count: 0 },
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
