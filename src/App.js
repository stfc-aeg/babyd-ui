import './App.css';

import React from 'react';
import {useState} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import {OdinApp, StatusBox, useAdapterEndpoint, TitleCard, DropdownSelector, WithEndpoint} from 'odin-react';
import 'odin-react/dist/index.css'

import {StatusBadge, LOKIConnectionAlert, LOKIClockGenerator, LOKICarrierInfo, LOKILEDDisplay, LOKIEnvironment, LOKICarrierTaskStatus} from './Loki.js'

import {Row, Col, Container, Dropdown, Card} from 'react-bootstrap'
//import {ArrowRight} from 'react-bootstrap-icons';
import * as Icon from 'react-bootstrap-icons';

function BabyD() {
    const periodicEndpoint = useAdapterEndpoint("detector", "", 1000);
    const staticEndpoint = useAdapterEndpoint("detector");
    const periodicSlowEndpoint = useAdapterEndpoint("detector", "", 5000);
    //const periodicDetectorEndpoint = useAdapterEndpoint("detector", "http://localhost:3000", 200);

    const [loki_connection_ok, set_loki_connection_ok] = useState(true);
    const [asic_enabled, set_asic_enabled] = useState(false);

    return (
        <OdinApp title="BabyD UI" navLinks={["BabyD Control", "Page Two"]}>
            <Container fluid>
                <Row>
                    <LOKIConnectionAlert adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} set_loki_connection_state={set_loki_connection_ok} />
                </Row>
                <Row>
                    <Col>
                        <Row>
                            <LOKIClockGenerator adapterEndpoint={staticEndpoint} />
                        </Row>
                        <Row>
                            <BabyD_System_Status adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} asic_enabled={asic_enabled} set_asic_enabled={set_asic_enabled} />
                        </Row>
                        <Row>
                            <BabyD_Data_Config adapterEndpoint={periodicEndpoint} asic_enabled={asic_enabled} />
                        </Row>
                        <Row>
                            <LOKILEDDisplay adapterEndpoint={periodicEndpoint} />
                        </Row>
                    </Col>
                    <Col>
                        <LOKIEnvironment environmentEndpoint={periodicSlowEndpoint}  records_to_render="20" />
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <LOKIConnectionAlert adapterEndpoint={periodicEndpoint} />
                </Row>
                <Row>
                    <Col>
                        <Row>
                            <LOKICarrierInfo adapterEndpoint={staticEndpoint} loki_connection_state={loki_connection_ok}/>
                        </Row>
                        <Row>
                            <LOKICarrierTaskStatus adapterEndpoint={periodicEndpoint} loki_connection_state={loki_connection_ok} />
                        </Row>
                    </Col>
                </Row>
                Page Two
            </Container>
        </OdinApp>
    )
}

function BabyD_System_Status({adapterEndpoint, loki_connection_state, asic_enabled, set_asic_enabled}) {

    let latest_asic_enabled = adapterEndpoint.data.application?.system_state?.ASIC_EN;
    if (latest_asic_enabled) {
        if (!asic_enabled) {
            // ASIC just enabled
            set_asic_enabled(true);
        }
    } else {
        if (asic_enabled) {
            // ASIC just disabled
            set_asic_enabled(false);
        }
    }

    let latest_main_enable = adapterEndpoint.data.application?.system_state?.MAIN_EN;

    return (
        <TitleCard title="BabyD System Status">
            <Container>
                <Row>
                    <Col class="col align-self-center">
                        <Card className="text-center" style={{width: '7rem'}}>
                            <Card.Body>
                                <Card.Title>
                                    Control PC
                                </Card.Title>
                                <Card.Text>
                                    <Icon.PcDisplayHorizontal size={30}/>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col class="col align-self-center">
                        <Icon.ArrowRight size={40} color={loki_connection_state ? "green" : "red"}/>
                    </Col>
                    <Col class="col align-self-center">
                        <Card className="text-center" style={{width: '7rem'}}>
                            <Card.Body>
                                <Card.Title>
                                    LOKI
                                </Card.Title>
                                <Card.Text>
                                    <Row>
                                        <Icon.Motherboard  size={30} color={loki_connection_state ? "green" : "red"}/>
                                    </Row>
                                    <Row>
                                        <span>{loki_connection_state ? "Connected" : "No Con"}</span>
                                    </Row>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col class="col align-self-center">
                        <Icon.ArrowRight size={40} color={latest_main_enable ? "green" : "red"}/>
                    </Col>
                    <Col class="col align-self-center">
                        <Card className="text-center" style={{width: '30rem'}}>
                            <Card.Body>
                                <Card.Title>
                                    BabyD
                                </Card.Title>
                                <Card.Text>
                                    <Row>
                                        <Icon.Motherboard  size={30} color={loki_connection_state ? "green" : "red"}/>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <StatusBox label="Main Enable" type={latest_main_enable ? "success" : "danger"}>{latest_main_enable}</StatusBox>
                                        </Col>
                                        <Col>
                                            <StatusBox label="Can Disconnect?" type={adapterEndpoint.data.application?.system_state?.DISCONNECT_OK ? "success" : "danger"}>{adapterEndpoint.data.application?.system_state?.DISCONNECT_OK ? "Safe" : "NO"}</StatusBox>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <StatusBadge label={asic_enabled ? "ASIC Enabled" : "ASIC Disabled"} type={asic_enabled ? "success" : "danger"}/>
                                        </Col>
                                        <Col>
                                            <StatusBadge label={adapterEndpoint.data.application?.system_state?.SYNC ? "ASIC SYNC High" : "ASIC SYNC Low"} type={adapterEndpoint.data.application?.system_state?.SYNC ? "success" : "danger"}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <StatusBadge label={"FireFly " + adapterEndpoint.data.application?.system_state?.FIREFLY} type={adapterEndpoint.data.application?.system_state?.FIREFLY == "initialised" ? "success" : "danger"}/>
                                        </Col>
                                        <Col>
                                            <StatusBadge label={"DAC u1 " + adapterEndpoint.data.application?.system_state?.DAC_U1} type={adapterEndpoint.data.application?.system_state?.DAC_U1 == "initialised" ? "success" : "danger"}/>
                                        </Col>
                                        <Col>
                                            <StatusBadge label={"DAC u2 " + adapterEndpoint.data.application?.system_state?.DAC_U2} type={adapterEndpoint.data.application?.system_state?.DAC_U2 == "initialised" ? "success" : "danger"}/>
                                        </Col>
                                        <Col>
                                            <StatusBadge label={"Retimer " + adapterEndpoint.data.application?.system_state?.RETIMER} type={adapterEndpoint.data.application?.system_state?.RETIMER == "initialised" ? "success" : "danger"}/>
                                        </Col>
                                        <Col>
                                            <StatusBadge label={"Mic284 " + adapterEndpoint.data.application?.system_state?.MIC284} type={adapterEndpoint.data.application?.system_state?.MIC284 == "initialised" ? "success" : "danger"}/>
                                        </Col>
                                    </Row>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </TitleCard>
    )
}


function BabyD_Main_Control({periodicEndpoint}) {
    // This should be the main component used to bring up the system. It should clearly indicate current state,
    // and if possible make obvious what next steps should be. Intuitiveness is key. The user should KNOW when
    // it's safe to power down etc just by glancing at it, and KNOW what to click next.
}

const FIFO_input_Dropdown = WithEndpoint(DropdownSelector);
const Aurora_input_Dropdown = WithEndpoint(DropdownSelector);
const Output_Dropdown = WithEndpoint(DropdownSelector);
const PRBS_len_Dropdown = WithEndpoint(DropdownSelector);
function BabyD_Data_Config({adapterEndpoint, asic_enabled}) {
    // Show intuitively the configuration of what's being output via the fast data and pixel logic as a flowchart.
    // Also allow configuration of these settings.
    // Also show the full pathway including the carrier board, therefore retimer settings and firefly settings
    
    let fifo_currently_selected = adapterEndpoint.data.application?.pipeline?.fifo_in_mux;
    let aurora_currently_selected = adapterEndpoint.data.application?.pipeline?.aurora_in_mux;
    let output_currently_selected = adapterEndpoint.data.application?.pipeline?.output_mux;
    let prbs_currently_selected = adapterEndpoint.data.application?.pipeline?.prbs_length;

    if (asic_enabled) {
        return (
            <TitleCard title="Fast Data Config">
                <Row>
                    <Col>
                        {/*<StatusBox label="FIFO input">{adapterEndpoint.data.application?.pipeline?.fifo_in_mux}</StatusBox>*/}
                        <FIFO_input_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/fifo_in_mux" buttonText={fifo_currently_selected ? "FIFO Input: " + fifo_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs15">prbs15</Dropdown.Item>
                            <Dropdown.Item eventKey="pixel">pixel</Dropdown.Item>
                        </FIFO_input_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="Aurora input">{adapterEndpoint.data.application?.pipeline?.aurora_in_mux}</StatusBox>*/}
                        <Aurora_input_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/aurora_in_mux" buttonText={aurora_currently_selected ? "Aurora Input: " + aurora_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="fifo">fifo</Dropdown.Item>
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                        </Aurora_input_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="Output">{adapterEndpoint.data.application?.pipeline?.output_mux}</StatusBox>*/}
                        <Output_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/output_mux" buttonText={output_currently_selected ? "Output: " + output_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey="prbs">prbs</Dropdown.Item>
                            <Dropdown.Item eventKey="aurora">aurora</Dropdown.Item>
                            <Dropdown.Item eventKey="user">user</Dropdown.Item>
                        </Output_Dropdown>
                    </Col>
                    <Col>
                        {/*<StatusBox label="PRBS">{adapterEndpoint.data.application?.pipeline?.prbs_length}</StatusBox>*/}
                        <PRBS_len_Dropdown endpoint={adapterEndpoint} event_type="select" fullpath="application/pipeline/prbs_length" buttonText={prbs_currently_selected ? "PRBS-" + prbs_currently_selected: "None selected"} >
                            <Dropdown.Item eventKey={15}>PRBS-15</Dropdown.Item>
                            <Dropdown.Item eventKey={23}>PRBS-23</Dropdown.Item>
                        </PRBS_len_Dropdown>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatusBox label="User Pattern">{adapterEndpoint.data.application?.pipeline?.user_pattern}{adapterEndpoint.data.application?.pipeline?.user_pattern.toString(16)}</StatusBox>
                    </Col>
                </Row>
            </TitleCard>
        )
    } else {
        return (<></>)
    }
}

function BabyD_SPIReadout() {
    // A basic trigger for SPI readout, with in-browser heatmap rendering.
    // Potentially allow configuration of system for multi-frame etc
}

function BabyD_Timing_Settings() {
    // Intuitively display the current timing settings
}

function BabyD_Bias_Control() {
    // Allow configuration of DACs, ADCs, both internal and external (bias settings).
    // Visually demonstrate where sources of signals are.
}

function BabyD_RegisterAccess() {
    // Simple UI element to read and write ASIC registers. Potentially a table or just
    // simple form? This will not be synchronous in any way, but could be quite useful.
    // This should also somehow make use of the field-based system for browsing register
    // mappings, as these should make things intuitive.
    // Consider efficient access, and whether this will end up spamming requests to the
    // ASIC where bits are volatile.
}

export default BabyD;
