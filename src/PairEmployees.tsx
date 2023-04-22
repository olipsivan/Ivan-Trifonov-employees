import React from 'react';
import Papa from "papaparse";
import './PairEmployees.css';

interface AppProps {};

interface AppState {
  employeeData: EmployeeData[];
};

interface EmployeeData {
  EmpID: string; 
  ProjectID: string;
  DateFrom: string;
  DateTo: string;
}

interface CommonProjectData {
  employeeOneId: string; 
  employeeTwoId: string;
  projectId: string;
  daysWorked: number;
}

interface SumData {
  employeeOneId: string; 
  employeeTwoId: string;
  sumDaysWorked: number;
}

class PairEmployees extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      employeeData: [],
    };
  }

  formatDateUK(date: string) {
    const year = parseInt(date.split('/')[2]);
    const month = parseInt(date.split('/')[1]) - 1;
    const day = parseInt(date.split('/')[0]);

    return date === "NULL" ? new Date() : new Date(year, month, day);
  }

  normalDate(date: string) {
    return date === "NULL" ? new Date() : new Date(date);
  }

  getOverlappingDays(employeeOneDateFrom: string, employeeOneDateTo: string, employeeTwoDateFrom: string, employeeTwoDateTo: string) {
    let overlappingDays = 0;

    const isFormatUK = Array.from(employeeOneDateFrom).some(char => char === "/");

    const startDateOne: Date = isFormatUK ? this.formatDateUK(employeeOneDateFrom) : this.normalDate(employeeOneDateFrom);
    const endDateOne: Date = isFormatUK ? this.formatDateUK(employeeOneDateTo) : this.normalDate(employeeOneDateTo);
    const startDateTwo: Date = isFormatUK ? this.formatDateUK(employeeTwoDateFrom) : this.normalDate(employeeTwoDateFrom);
    const endDateTwo: Date = isFormatUK ? this.formatDateUK(employeeTwoDateTo) : this.normalDate(employeeTwoDateTo);
  
    const start = startDateOne < startDateTwo ? startDateTwo : startDateOne;
    const end = endDateOne < endDateTwo ? endDateOne : endDateTwo;

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
  
    if (end >= start) {
      const timeDifference = Math.abs(endTime - startTime);
      overlappingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    }
    
    return overlappingDays;
  };

  getCommonProjectData(employeeData: EmployeeData[]) {
    let commonProjectData: CommonProjectData[] = [];

    for(let i = 0; i < employeeData.length - 1; i++) {
      const projectId = employeeData[i].ProjectID;

      for(let j = i + 1; j < employeeData.length; j++) {

        if(projectId === employeeData[j].ProjectID) {
          const daysWorked = this.getOverlappingDays(employeeData[i].DateFrom, employeeData[i].DateTo, employeeData[j].DateFrom, employeeData[j].DateTo);

          if(daysWorked) {
            const item: CommonProjectData = {
              employeeOneId: employeeData[i].EmpID,
              employeeTwoId: employeeData[j].EmpID,
              projectId,
              daysWorked,
            };

            commonProjectData.push(item);
          }
        }
      }
    }

    return commonProjectData;
  }

  getSumData(commonProjectData: CommonProjectData[]) {
    let sumData = [];

    for(let i = 0; i < commonProjectData.length; i++) {
      
      const isDuplicate = sumData.find(sum => sum.employeeOneId === commonProjectData[i].employeeOneId && sum.employeeTwoId === commonProjectData[i].employeeTwoId);

      if(isDuplicate) {
        continue;
      } else {
        let sum = commonProjectData[i].daysWorked;

        for(let j = i + 1; j < commonProjectData.length; j++) {
            if(commonProjectData[i].employeeOneId === commonProjectData[j].employeeOneId && commonProjectData[i].employeeTwoId === commonProjectData[j].employeeTwoId) {
                sum += commonProjectData[j].daysWorked;
            }
        }

        const item: SumData = {
          employeeOneId: commonProjectData[i].employeeOneId,
          employeeTwoId: commonProjectData[i].employeeTwoId,
          sumDaysWorked: sum,
        };

        sumData.push(item);
      }
    }

    return sumData;
  }

  renderTableBody() {
    const { employeeData } = this.state;
    
    const commonProjectData = this.getCommonProjectData(employeeData);
    console.log(commonProjectData);
    
    const sumData = this.getSumData(commonProjectData);
    console.log(sumData);

    let result = {} as SumData;
    if(sumData.length) {
      result = sumData.reduce((maxEmployee, employee) => maxEmployee.sumDaysWorked > employee.sumDaysWorked ? maxEmployee : employee);
    }

    return commonProjectData.map((item, i) => {
        return item.employeeOneId === result.employeeOneId && item.employeeTwoId === result.employeeTwoId ? 
          <tr key={i}>
            <td>{item.employeeOneId}</td>
            <td>{item.employeeTwoId}</td>
            <td>{item.projectId}</td>
            <td>{item.daysWorked}</td>
          </tr> 
        : null;
    });
  }

  handleOnFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if(files) {
      const file = files[0];

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          let resultsData: EmployeeData[] = [];

          results.data.forEach(item => {
            resultsData.push(item as EmployeeData);
          });

          resultsData.sort((a,b) => parseInt(a.EmpID) - parseInt(b.EmpID));

          this.setState({ employeeData: resultsData });
        },
      });
    }
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>REACT JS APP TO READ A CSV FILE</h1>
        <h2>Find The Pair Of Employees Who Have Worked Together The Longest Period Of Time</h2>

        <input type="file" accept=".csv" onChange={(event) => this.handleOnFileChange(event)}/>
        <br></br>
        <br></br>

        <table className="center">
          <thead>
            <tr>
              <th>Employee ID #1</th>
              <th>Employee ID #2</th>
              <th>Project ID</th>
              <th>Days worked</th>
            </tr>
          </thead>

          <tbody>
            {this.renderTableBody()}
          </tbody>        
        </table>

      </div>
    );
  }
}

export default PairEmployees;
