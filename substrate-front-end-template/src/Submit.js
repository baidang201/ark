import React, { useState } from 'react';
import { Form, Input, Grid, Label, Icon, Dropdown } from 'semantic-ui-react';
import { TxButton } from './substrate-lib/components';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ 
    positionX: 0, 
    positionY: 0, 
    reason: 'Unknown', 
    timestamp: 0, 
    meetintLink: "www.z.cn/meeting/xxx", 
  });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { positionX, positionY, reason, timestamp, meetintLink } = formState;

  const friendOptions = [
    {
      key: 'Unknown',
      text: 'Unknown',
      value: 'Unknown',
    },
    {
      key: 'Earthquake',
      text: 'Earthquake',
      value: 'Earthquake',
    },
    {
      key: 'Mudslide',
      text: 'Mudslide',
      value: 'Mudslide',
    },
    {
      key: 'Torrent',
      text: 'Torrent',
      value: 'Torrent',
    },
    {
      key: 'Flood',
      text: 'Flood',
      value: 'Flood',
    },
    {
      key: 'Hijacking',
      text: 'Hijacking',
      value: 'Hijacking',
    },
    {
      key: 'Explosion',
      text: 'Explosion',
      value: 'Explosion',
    },
  ]

  return (
    <Grid.Column width={8}>
      <h1>Submit New Situations</h1>
      <Form>
        <Form.Field>
          <Input
            fluid
            label='positionX'
            type='number'
            placeholder='positionX'
            state='positionX'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='positionY'
            type='number'
            placeholder='positionY'
            state='positionY'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Label>
            reason
          </Label>
          <Dropdown
            placeholder='Select reason'
            fluid
            selection
            options={friendOptions}
            state='reason'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='timestamp'
            type='number'
            placeholder='timestamp'
            state='timestamp'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='meetintLink'
            type='text'
            placeholder='meetintLink'
            state='meetintLink'
            onChange={onChange}
          />
        </Form.Field>

        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='Submit'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'submit',
              inputParams: [positionX, positionY, reason, timestamp, meetintLink],
              paramFields: [true, true, true, true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
