import React, { useEffect, useState } from 'react';
import { Table, Grid, Button, Label} from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const { api, keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [balances, setBalances] = useState({});

  const [situationCnt, setSituationCnt] = useState(0)
  const [situations, setSituations] = useState([]);
  const { accountPair } = props;

  function isHexPrefixed(str) {
    if (typeof str !== 'string') {
      throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
    }
  
    return str.slice(0, 2) === '0x';
  }
  
  function stripHexPrefix(str) {
    if (typeof str !== 'string') {
      return str;
    }
  
    return isHexPrefixed(str) ? str.slice(2) : str;
  }

  function hex2a(hexx) {
    const hex = stripHexPrefix(hexx.toString());//force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  const fetchSituationCnt = () => {
    let unsubscribeAll = null;

    api.query.templateModule.nextSituationId(amount => {
      const situationCnt = amount.toJSON()
      console.log("situationCnt:", situationCnt);
      setSituationCnt(situationCnt)
    }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }

  useEffect(fetchSituationCnt, [api, keyring])

  useEffect(() => {
    let unsubscribeAll = null;

    if (0 >= situationCnt) {
      return
    }

    api.query.templateModule.situations.multi([...Array(situationCnt).keys()], (data) => {
      const tempData = []
      let i = 0;
      data.map(row => {
        if (row.isNone) {
          tempData.push('no data')
        } else {
          const item = row.toJSON()
          item["index"] = i;
          item["meetintLink"] = hex2a(item["meetintLink"]);
          // // console.log('dna == ' + kittyDna)
          tempData.push(item);
          i++;
        }
      })
      setSituations(tempData)
      console.log(tempData);
    }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring, setSituations, situationCnt]);

  //useEffect(populateKitties, [situations])


  return (
    <Grid.Column>
      <h1>Situations</h1>

      <Label basic color='teal'>
        {status}
      </Label>
      <Table celled striped size='small'>
        <Table.Body>
          <Table.Row>
            <Table.Cell width={1} textAlign='right'>
              <strong>index</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>positionX</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>positionY</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>reason</strong>
            </Table.Cell>
            <Table.Cell width={2}>
              <strong>timestamp</strong>
            </Table.Cell>
            <Table.Cell width={8}>
              <strong>meetintLink</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>upVotes</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>downVotes</strong>
            </Table.Cell>
            <Table.Cell width={5}>
              <strong>submitter</strong>
            </Table.Cell>
            <Table.Cell width={1}>
              <strong>status</strong>
            </Table.Cell>
            <Table.Cell width={3}>
            </Table.Cell>

          </Table.Row>
          {situations.map(situation =>
            <Table.Row key={situation.index}>
              <Table.Cell width={1} textAlign='right'>{situation.index}</Table.Cell>
              <Table.Cell width={1}>{situation.positionX}</Table.Cell>
              <Table.Cell width={1}>{situation.positionY}</Table.Cell>
              <Table.Cell width={1}>{situation.reason}</Table.Cell>
              <Table.Cell width={2}>{situation.timestamp}</Table.Cell>
              <Table.Cell width={8}><a href={situation.meetintLink}>{situation.meetintLink}</a></Table.Cell>
              <Table.Cell width={1}>{situation.upVotes}</Table.Cell>
              <Table.Cell width={1}>{situation.downVotes}</Table.Cell>
              <Table.Cell width={5}>{situation.submitter}</Table.Cell>
              <Table.Cell width={1}>{situation.status}</Table.Cell>
              <Table.Cell width={1}>
                <TxButton
                  accountPair={accountPair}
                  label='Close'
                  type='SIGNED-TX'
                  setStatus={setStatus}
                  attrs={{
                    palletRpc: 'templateModule',
                    callable: 'close',
                    inputParams: [situation.index],
                    paramFields: [true]
                  }}
                />
                <TxButton
                  accountPair={accountPair}
                  label='Thank'
                  type='SIGNED-TX'
                  setStatus={setStatus}
                  attrs={{
                    palletRpc: 'templateModule',
                    callable: 'thank',
                    inputParams: [situation.index, 1000000000000],
                    paramFields: [true, true]
                  }}
                />
                <TxButton
                  accountPair={accountPair}
                  label='UpVote'
                  type='SIGNED-TX'
                  setStatus={setStatus}
                  attrs={{
                    palletRpc: 'templateModule',
                    callable: 'upVote',
                    inputParams: [situation.index],
                    paramFields: [true]
                  }}
                />
                <TxButton
                  accountPair={accountPair}
                  label='DownVote'
                  type='SIGNED-TX'
                  setStatus={setStatus}
                  attrs={{
                    palletRpc: 'templateModule',
                    callable: 'downVote',
                    inputParams: [situation.index],
                    paramFields: [true]
                  }}
                />
              </Table.Cell>
            </Table.Row>
            
          )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}