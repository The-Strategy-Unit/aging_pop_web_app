function getTableData(iData) {
  const bins = [
    { name: '<18' , accept: d => d.under <= 18, count: 0 },
    { name: '18—64' , accept: d => d.under > 18 && d.under <= 65, count: 0 },
    { name: '65+' , accept: d => d.under > 65, count: 0 },
  ];

  iData.data.forEach(function(d) {
    for (const bin of bins) {
      if (bin.accept(d)) {
        bin.count += (d.f + d.m);
        break;
      }
    }
  });
  
  const total = iData.totals.f + iData.totals.m;

  bins.forEach(d => d.pct = (d.count / total) * 100);

  return { bins, total };
}


export { getTableData };
