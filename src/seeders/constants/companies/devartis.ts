import { uuids } from "../uuids";
import { ApprovalStatus } from "../../../models/ApprovalStatus/index";

export const devartis = {
  company: {
    uuid: uuids.companies.devartis.uuid,
    cuit: "30711819017",
    companyName: "Devartis",
    businessName: "Arcos violetas S.A",
    businessSector: "Servicios",
    approvalStatus: ApprovalStatus.approved,
    // tslint:disable-next-line:max-line-length
    logo: `data:image/jpeg;base64,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79Xl2qNLgHSX3QwT8p2cgvWsNZs4CkZydiwJSZXIMxPYfCdxpaA1XQssBGIr4HxamaJjdkDsnj6xBqNh1Y98LJUJew/hXGWXvfWWTpUGPLdCR7+tWpZo6uVuWGDL3N1fgFhwW3pfeD4sWOhqjuWnB0CwCWHwUnvsBUmEQ2Jd7HUAouG6HUi191h23WfQKvFyC5EubNzGwMEhmNNUOMHHdCFQDFrk7dGPiAhReJ6yAyqDIBPPq1/KAEvNS81LXbYFSFw0SE0eJgvIgb2m8Xaw4Wusp2Akezx5jBkKAP51ussFkBCJg+lKgAar+l2/BJgIMXy8Sy0TA4qpDLKqjyHYZcgL903Qa5au+Y6Hg8KMEsCpgw0/7vwA9IkhIR2sE8+7FaC7D0m5OJmQQot5TeSWBee+AkezyAMZ4GQcjHreeLNN9LULkuV8Rf8AjUixRgXPYdm8LNSsLUP6/Hia7M87VHkO2nk7gCKmkWLTg7OEPndAhReJnxEnCmi3lN5J2sds97gSPZ5OQCENAD+H2vfC6BCi8TiKtskjVFG52GXKC1cltjky4rnMpILGTh3zEHwaofLblNz+gXQfgdovtcl0Vd/yK9SvDPmXRiy5UiMEODUbGji9UvRfj9FkrpVQ1rea8GboChDcAVWxfJJ1VhZ6BTAIxTlkYTvRa4VXRs4DeiwaAQ9EOtqsnhdtPAvvodOXIyAvsvDesRLT7A6NgkCof6tNAHLwevBZNRo2aroUc96GhFnhRcS2mPkWVg76K90LMltCEJt7F9D5U6BZvE6wmsVNhsw3lXwClNlqEagdymXSea4bkhHktN1nO+Usu1jOx3WMzoo55sZKAats6ba/tZEp2nPYWcFozfKbaV4x2A/8M//ZICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA==`,
    slogan: "We craft web applications for great businesses",
    description:
      "Our projects are dynamic and challenging with an entertaining " +
      "working environment and with opportunities to provide your knowledge in varying " +
      "technologies and tasks.",
    website: "https://www.devartis.com/",
    email: "info@devartis.com",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  photos: [
    {
      uuid: "f0647ecc-be43-451c-a8e8-007b9f2e8af2",
      photo: "https://miro.medium.com/max/11520/1*Om-snCmpOoI5vehnF6FBlw.jpeg",
      companyUuid: uuids.companies.devartis.uuid,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "b928f0e6-92de-4bbf-93fe-1468f37a836d",
      photo: "https://pbs.twimg.com/media/EK_OWQEWwAIwDXr.jpg",
      companyUuid: uuids.companies.devartis.uuid,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "19566569-41ed-4246-93cc-8563358d9a7a",
      photo:
        "https://www.filepicker.io/api/file/9PbWZ8ZVTTiFogUOEebI/" +
        "convert?w=1049&h=381&fit=scale",
      companyUuid: uuids.companies.devartis.uuid,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      uuid: "00054373-eb83-49ca-9957-e472979294bb",
      photo: "https://pbs.twimg.com/media/EK_OVsXXYAE-Y-p.jpg",
      companyUuid: uuids.companies.devartis.uuid,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  phoneNumbers: [
    {
      phoneNumber: "1148567112",
      companyUuid: uuids.companies.devartis.uuid,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};
