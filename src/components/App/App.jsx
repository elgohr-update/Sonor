import React from 'react';
import Keycloak from 'keycloak-js';
import View from '../View/View';
import Header from '../Header/Header';
import DataFormatter from '../../utils/DataFormatter';
import { KEYCLOAK, NO_AUTH } from '../../utils/constants.json';
import './App.css';
import initConfiguration from '../../initConfiguration';
import D from '../../i18n';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keycloak: null,
      authenticated: false,
      data: null,
      currentView: null,
    };
  }

  componentDidMount() {
    initConfiguration();
    if (window.localStorage.getItem('AUTHENTICATION_MODE') === NO_AUTH) {
      const dataRetreiver = new DataFormatter();
      dataRetreiver.getUserInfo((data) => {
        this.setState({ authenticated: true, data });
      });
    } else if (window.localStorage.getItem('AUTHENTICATION_MODE') === KEYCLOAK) {
      const keycloak = Keycloak('/keycloak.json');
      keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
        const dataRetreiver = new DataFormatter(keycloak.token);
        dataRetreiver.getUserInfo((data) => {
          this.setState({ keycloak, authenticated, data });
        });
      });
    }
  }

  setCurrentView(currentView) {
    this.setState({ currentView });
  }

  render() {
    const {
      keycloak, authenticated, data, currentView,
    } = this.state;
    if (keycloak || authenticated) {
      if (authenticated) {
        return (
          <div className="App">
            <Header
              user={data}
              currentView={currentView}
              returnFunc={() => { this.content.handleReturnButtonClick(); }}
              goToMonitoringTable={(mode) => {
                this.content.handleMonitoringTableClick(null, null, mode);
              }}
              goToReview={() => {
                this.content.handleReviewClick(null);
              }}
              goToRemind={() => {
                this.content.handleRemindClick(null);
              }}
              showPreferences={() => {
                this.content.showPreferences();
              }}
            />
            <View
              currentView={currentView}
              setCurrentView={(view) => this.setCurrentView(view)}
              token={keycloak ? keycloak.token : null}
              ref={(instance) => { this.content = instance; }}
            />
          </div>
        );
      }
      return (<div>{D.unableToAuthenticate}</div>);
    }
    return (
      <div>{D.initializing}</div>
    );
  }
}

export default App;
