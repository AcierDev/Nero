"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClientWrapper_1 = require("./ClientWrapper");
require('dotenv').config();
new ClientWrapper_1.ClientWrapper();
ClientWrapper_1.ClientWrapper.get().login(process.env.TOKEN);
