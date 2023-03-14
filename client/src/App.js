import './App.css';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { MDBBadge, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle } from 'mdb-react-ui-kit';

function App() {
  return (
    <div className="App">

      <MDBContainer className='border'>
        <MDBRow>
          <MDBCol md='6' className="border d-flex fs-1 justify-content-start">
            <p className="text-light">Onchain Surveys</p>
          </MDBCol>
          <MDBCol md='6' className="border d-flex justify-content-end">

            <MDBBtn size='lg' color='success'>Sign In</MDBBtn>


            <MDBDropdown>
        <MDBDropdownToggle size='lg' className='me-2'>
        <MDBIcon far icon="user" /> Profile
        </MDBDropdownToggle>
        <MDBDropdownMenu responsive='end'>
          <MDBDropdownItem link>Menu item</MDBDropdownItem>
          <MDBDropdownItem link>Menu item</MDBDropdownItem>
          <MDBDropdownItem link>Menu item</MDBDropdownItem>
        </MDBDropdownMenu>
      </MDBDropdown>

          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <br></br>
      <MDBContainer className=' border '>
        <MDBRow className='gy-5 text-light '>
          <MDBCol size='12' className='d-flex justify-content-center'>
            <p className="align-items-center text-light align-items-center fs-3">All Surveys</p>
          </MDBCol>
        </MDBRow>
        <MDBCol>
          <MDBTable className='text-light' align='middle'>
            <MDBTableHead>
              <tr>
                <th scope='col'>Survey Name</th>
                <th scope='col'>Category</th>
                <th scope='col'>Date</th>
                <th scope='col'>Number of Questions</th>
                <th scope='col'>Status</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              <tr>
                <td>
                  <div className='d-flex align-items-center'>
                    <img
                      src='https://mdbootstrap.com/img/new/avatars/8.jpg'
                      alt=''
                      style={{ width: '45px', height: '45px' }}
                      className='rounded-circle'
                    />
                    <div className='ms-3'>
                      <p className='fw-bold mb-1'>John Doe</p>
                      <p className='text-muted mb-0'>john.doe@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className='fw-normal mb-1'>Software engineer</p>
                  <p className='text-muted mb-0'>IT department</p>
                </td>
                <td>
                  <MDBBadge color='success' pill>
                    Active
                  </MDBBadge>
                </td>
                <td>Senior</td>
                <td>
                  <MDBBadge color='success' pill>
                    Active
                  </MDBBadge>
                </td>
              </tr>
              <tr>
                <td>
                  <div className='d-flex align-items-center'>
                    <img
                      src='https://mdbootstrap.com/img/new/avatars/6.jpg'
                      alt=''
                      style={{ width: '45px', height: '45px' }}
                      className='rounded-circle'
                    />
                    <div className='ms-3'>
                      <p className='fw-bold mb-1'>Alex Ray</p>
                      <p className='text-muted mb-0'>alex.ray@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className='fw-normal mb-1'>Consultant</p>
                  <p className='text-muted mb-0'>Finance</p>
                </td>
                <td>
                  <MDBBadge color='primary' pill>
                    Onboarding
                  </MDBBadge>
                </td>
                <td>Junior</td>
                <td>
                  <MDBBadge color='primary' pill>
                    Onboarding
                  </MDBBadge>
                </td>
              </tr>
              <tr>
                <td>
                  <div className='d-flex align-items-center'>
                    <img
                      src='https://mdbootstrap.com/img/new/avatars/7.jpg'
                      alt=''
                      style={{ width: '45px', height: '45px' }}
                      className='rounded-circle'
                    />
                    <div className='ms-3'>
                      <p className='fw-bold mb-1'>Kate Hunington</p>
                      <p className='text-muted mb-0'>kate.hunington@gmail.com</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className='fw-normal mb-1'>Designer</p>
                  <p className='text-muted mb-0'>UI/UX</p>
                </td>
                <td>
                  <MDBBadge color='warning' pill>
                    Awaiting
                  </MDBBadge>
                </td>
                <td>Senior</td>
                <td>
                  <MDBBadge color='warning' pill>
                    Awaiting
                  </MDBBadge>
                </td>
              </tr>
            </MDBTableBody>
          </MDBTable>
        </MDBCol>
      </MDBContainer>
    </div>




  );
}

export default App;
