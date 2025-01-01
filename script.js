document.getElementById('bankersForm').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function generateResourceInstances() {
    const numResources = document.getElementById('numResources').value;
    const resourceInstancesForm = document.getElementById('resourceInstancesForm');

    resourceInstancesForm.innerHTML = '<br><hr><label><b>Resource Instances:</b></label>';

    let table = '<table><tr>';
    for (let j = 0; j < numResources; j++) {
        table += `<th><b>Resource ${j}</b></th>`;
    }
    table += '</tr><tr>';
    for (let j = 0; j < numResources; j++) {
        table += `<td><input type="number" id="instances_${j}" required></td>`;
    }
    table += '</tr></table><br><hr><br>';
    resourceInstancesForm.innerHTML += table;
}

function generateTables() {
    const numProcesses = document.getElementById('numProcesses').value;
    const numResources = document.getElementById('numResources').value;
    const resourceForm = document.getElementById('resourceForm');

    let allocationTable = '<br><label><b>Allocation Matrix:</b></label><table><br>';     //Allocation Matrix
    let maxTable = '<hr><br><label><b>Max Matrix:</b></label><table><br>';

    allocationTable += '<tr><th></th>';
    maxTable += '<tr><th></th>';
    for (let j = 0; j < numResources; j++) {
        allocationTable += `<th><b>Resource ${j}</b></th>`;
        maxTable += `<th>Resource ${j}</th>`;
    }
    allocationTable += '</tr><br>';
    maxTable += '</tr>';

    for (let i = 0; i < numProcesses; i++) {
        allocationTable += `<tr><td><b>Process ${i}</b></td>`;
        maxTable += `<tr><td>Process ${i}</td>`;
        for (let j = 0; j < numResources; j++) {
            allocationTable += `<td><input type="number" id="alloc_${i}_${j}" required></td>`;
            maxTable += `<td><input type="number" id="max_${i}_${j}" required></td>`;
        }
        allocationTable += '</tr>';
        maxTable += '</tr>';
    }

    resourceForm.innerHTML = allocationTable + '</table>' + maxTable + '</table>';
}

function calculate() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const numResources = parseInt(document.getElementById('numResources').value);

    let allocation = [];
    let max = [];
    let totalInstances = [];

    for (let i = 0; i < numProcesses; i++) {
        allocation[i] = [];
        max[i] = [];
        for (let j = 0; j < numResources; j++) {
            allocation[i][j] = parseInt(document.getElementById(`alloc_${i}_${j}`).value);
            max[i][j] = parseInt(document.getElementById(`max_${i}_${j}`).value);
        }
    }

    for (let j = 0; j < numResources; j++) {
        totalInstances[j] = parseInt(document.getElementById(`instances_${j}`).value);
    }


    let available = totalInstances.map((total, j) => {
        let sumAllocation = allocation.reduce((sum, processAlloc) => sum + processAlloc[j], 0);   // Calculate the available matrix
        return total - sumAllocation;
    });

    const result = bankersAlgorithm(allocation, max, available);
    document.getElementById('results').innerHTML = result;
}

function bankersAlgorithm(allocation, max, available) {
    const numProcesses = allocation.length;
    const numResources = allocation[0].length;

    let work = [...available];
    let finish = new Array(numProcesses).fill(false);
    let safeSequence = [];

    let need = allocation.map((alloc, i) => 
        alloc.map((a, j) => max[i][j] - a)           
    );

    let needTable = '<br><label><b><hr>Need Matrix:</b></label><table><tr><th></th>';   //Need matrix calculation
    for (let j = 0; j < numResources; j++) {
        needTable += `<th>Resource ${j}</th>`;
    }
    needTable += '</tr>';
    for (let i = 0; i < numProcesses; i++) {
        needTable += `<tr><td>Process ${i}</td>`;
        for (let j = 0; j < numResources; j++) {
            needTable += `<td>${need[i][j]}</td>`;
        }
        needTable += '</tr>';
    }
    needTable += '</table><br>';

    let availableTable = '<br><label><b><hr>Available Matrix:</b></label><table><tr>';   // Available matrix
    for (let j = 0; j < numResources; j++) {
        availableTable += `<th>Resource ${j}</th>`;
    }
    availableTable += '</tr><tr>';
    for (let j = 0; j < numResources; j++) {
        availableTable += `<td>${available[j]}</td>`;
    }
    availableTable += '</tr></table><br><hr><br>';

    while (safeSequence.length < numProcesses) {
        let found = false;
        for (let p = 0; p < numProcesses; p++) {
            if (!finish[p]) {
                let canAllocate = need[p].every((n, j) => n <= work[j]);
                if (canAllocate) {
                    for (let j = 0; j < numResources; j++) {
                        work[j] += allocation[p][j];
                    }
                    safeSequence.push(p);
                    finish[p] = true;
                    found = true;
                }
            }
        }
        if (!found) {
            return availableTable + needTable + '<div style="color: red;">System is in a deadlock state.</div>';
        }
    }

    return availableTable + needTable + `<div style="color: green;">System is in a safe state.<br>Safe Sequence: ${safeSequence.join(', ')}<br>Process Sequence: ${safeSequence.join(' -> ')}</div>`;
}
