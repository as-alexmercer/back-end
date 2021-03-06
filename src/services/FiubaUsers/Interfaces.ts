export interface IFiubaUsersApiSuccessResponse {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body": {
      "ns1:AutenticarResponse": {
        return: boolean;
      };
    };
  };
}

export interface IFiubaUsersApiErrorResponse {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body": {
      "SOAP-ENV:Fault": {
        faultcode: string;
        faultactor: string;
        faultstring: string;
        detail: string;
      };
    };
  };
}

export interface ICredentials {
  dni: string;
  password: string;
}
