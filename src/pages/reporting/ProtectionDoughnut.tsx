import { Doughnut } from 'react-chartjs-2';
import React from 'react';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: {
      display: false,
    },
    tooltips: {
      enabled: true,
    },
  },
};

const backgroundColor = ['#0f9d58', '#38689E', '#c70015'];

export default ({ report, type }) => {
  const label = {
    backups: 'Protected',
    restores: 'Restored',
  };

  const dataset = {
    label: `Data ${label[type]}: ${report[type].totalData}`,
    data: [
      report[type].successful,
      report[type].inProgress,
      report[type].failed,
    ],
    total: report[type].total,
    backgroundColor,
    borderWidth: 1,
  };

  const data = {
    labels: ['Successful', 'In Progress', 'Failed'],
    datasets: [dataset],
  };

  return (
    <div style={{ height: '220px', position: 'relative' }} className={'mt-3'}>
      <h5 className="text-center">{data.datasets[0].label}</h5>
      {!!data.datasets[0].total && (
        <h3 className="text-jumbotron">
          {(
            (data.datasets[0].data[0] / data.datasets[0].total) *
            100
          ).toFixed()}
          %<small className="d-block">Success</small>
        </h3>
      )}

      {!data.datasets[0].total && (
        <h3 className="text-jumbotron">
          <span>No data</span>
        </h3>
      )}
      <Doughnut data={data} options={options} />
    </div>
  );
};
