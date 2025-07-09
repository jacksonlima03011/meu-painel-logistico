function generateAllPositions(street) {
  const positions = [];
  for (let main = 1; main <= 2; main++) {
    const mainStr = main.toString().padStart(2, '0');
    for (let level = 0; level <= 1; level++) {
      const levelStr = level.toString().padStart(2, '0');
      for (let pos = 1; pos <= 2; pos++) {
        const posStr = pos.toString().padStart(2, '0');
        positions.push(`${street}${mainStr}-${levelStr}-${posStr}`);
      }
    }
  }
  return positions;
}

const mockData = {
  streets: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  items: []
};

mockData.streets.forEach(street => {
  const positions = generateAllPositions(street);
  positions.forEach(pos => {
    const randomStatus = Math.floor(Math.random() * 4);
    let status, priority, description;

    if (randomStatus === 0) {
      status = 'OK';
      priority = 'green';
      description = 'Nenhuma ação necessária';
    } else if (randomStatus === 1) {
      status = 'ALERTA';
      priority = 'orange';
      description = 'Validar movimentação no SAP';
    } else if (randomStatus === 2) {
      status = 'URGENTE';
      priority = 'red';
      description = 'Verificar Fisicamente';
    } else {
      status = 'EM PROCESSAMENTO';
      priority = 'blue';
      description = 'Aguardando fechamento do dia';
    }

    mockData.items.push({
      id: pos,
      status,
      priority,
      street,
      description
    });
  });
});

function initTable() {
  const tbody = document.querySelector('#logisticsTable tbody');
  tbody.innerHTML = '';

  mockData.items.forEach(item => {
    const row = document.createElement('tr');
    row.dataset.street = item.street;
    row.dataset.priority = item.priority;

    row.innerHTML = `
      <td class="position-link" style="cursor:pointer; text-decoration:underline; color:blue;">${item.id}</td>
      <td class="highlight-${item.priority}">${item.status}</td>
      <td>RUA ${item.street}</td>
      <td>${item.description}</td>
    `;

    row.addEventListener('mouseover', function(e) {
      const tooltip = document.getElementById('tooltip');
      tooltip.textContent = `${item.id}: ${item.description}`;
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.opacity = '1';
    });
    row.addEventListener('mouseout', function() {
      document.getElementById('tooltip').style.opacity = '0';
    });

    row.querySelector('.position-link').addEventListener('click', function() {
      window.location.href = `detalhe.html?pos=${encodeURIComponent(item.id)}`;
    });

    tbody.appendChild(row);
  });
}

function initCharts() {
  const statusCtx = document.getElementById('statusChart').getContext('2d');
  new Chart(statusCtx, {
    type: 'pie',
    data: {
      labels: ['OK', 'Alerta', 'Urgente', 'Processo'],
      datasets: [{
        data: [
          mockData.items.filter(i => i.priority === 'green').length,
          mockData.items.filter(i => i.priority === 'orange').length,
          mockData.items.filter(i => i.priority === 'red').length,
          mockData.items.filter(i => i.priority === 'blue').length
        ],
        backgroundColor: ['#00ff00','orange', 'red', '#008cff']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Status das Posições'
        }
      }
    }
  });

  const streetCtx = document.getElementById('streetChart').getContext('2d');
  new Chart(streetCtx, {
    type: 'bar',
    data: {
      labels: mockData.streets.map(s => `RUA ${s}`),
      datasets: [
        {
          label: 'Posições OK',
          data: mockData.streets.map(street =>
            mockData.items.filter(i => i.street === street && i.priority === 'green').length),
          backgroundColor: '#00ff00'
        },
        {
          label: 'Alerta',
          data: mockData.streets.map(street =>
            mockData.items.filter(i => i.street === street && i.priority === 'orange').length),
          backgroundColor: 'orange'
        },
        {
          label: 'Urgente',
          data: mockData.streets.map(street =>
            mockData.items.filter(i => i.street === street && i.priority === 'red').length),
          backgroundColor: 'red'
        },
        {
          label: 'Processo',
          data: mockData.streets.map(street =>
            mockData.items.filter(i => i.street === street && i.priority === 'blue').length),
          backgroundColor: '#008cff'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Status por Rua'
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
}

document.querySelectorAll('.street-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.street-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const street = this.dataset.street;
    const rows = document.querySelectorAll('#logisticsTable tbody tr');
    rows.forEach(row => {
      row.style.display = (street === 'all' || row.dataset.street === street) ? '' : 'none';
    });
  });
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    const activeStreet = document.querySelector('.street-btn.active').dataset.street;
    const rows = document.querySelectorAll('#logisticsTable tbody tr');
    rows.forEach(row => {
      const showByStatus = filter === 'all' || row.dataset.priority === filter;
      const showByStreet = activeStreet === 'all' || row.dataset.street === activeStreet;
      row.style.display = (showByStatus && showByStreet) ? '' : 'none';
    });
  });
});

document.getElementById('exportBtn').addEventListener('click', function() {
  const table = document.getElementById('logisticsTable');
  const wb = XLSX.utils.table_to_book(table);
  XLSX.writeFile(wb, "monitoramento_posicoes.xlsx");
});

document.getElementById('refreshBtn').addEventListener('click', function() {
  alert('Dados atualizados! (Simulação)');
  initTable();
  initCharts();
});

document.addEventListener('DOMContentLoaded', function() {
  initTable();
  initCharts();
});
