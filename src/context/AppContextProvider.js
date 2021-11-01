import React from 'react';
import { Provider as CatatMeterContext } from './CatatMeterContext';
import { Provider as AuthContext } from './AuthContext';
import { Provider as ReportContext } from './ReportContext';
import { Provider as ScheduleContext } from './ScheduleContext';

import { combineComponents } from '../utils/combineComponents';

const providers = [
  CatatMeterContext,
  AuthContext,
  ReportContext,
  ScheduleContext
]
export const AppContextProvider = combineComponents(...providers);