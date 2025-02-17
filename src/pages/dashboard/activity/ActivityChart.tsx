import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  commonSizeOptions,
  tickSizeOptions,
} from 'pages/dashboard/chargeback/commonSizeOptions';
import moment from 'moment-timezone';
import dashboardService from 'services/dashboard-service';
import { colors } from 'pages/dashboard/chargeback/colors';

const emptyChartData = {
  labels: [],
  datasets: [
    { data: [], label: 'Backup', backgroundColor: colors[0].backgroundColor },
    { data: [], label: 'Restore', backgroundColor: colors[1].backgroundColor },
  ],
};

export default () => {
  const [chartData, setChartData] = useState(emptyChartData);

  const getChartData = async () => {
    const res = await dashboardService.getDashboardVmBackupSizeStats();
    emptyChartData.labels = [...Array(15)]
      .map((item, index) => index)
      .map((el) => moment().subtract(el, 'days').format('DD MMM'))
      .reverse();
    emptyChartData.datasets[0].data = Object.values(
      res.backupSizeStatsResponses,
    );
    emptyChartData.datasets[1].data = Object.values(
      res.restoreSizeStatsResponses,
    );
    setChartData({ ...emptyChartData });
  };

  useEffect(() => {
    getChartData();
  }, []);

  // Restore options https://github.com/reactchartjs/react-chartjs-2
  return (
    <div>
      <Bar
        data={chartData}
        options={{
          ...commonSizeOptions('y'),
          scales: {
            y: tickSizeOptions(chartData.datasets[0].data),
          },
        }}
      />
    </div>
  );
};
