import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

const vpcA = new awsx.ec2.Vpc("vpc-a", {
  cidrBlock: "100.0.0.0/16",
  instanceTenancy: "default",
  numberOfAvailabilityZones: 1,
  subnetSpecs: [
    { type: awsx.ec2.SubnetType.Public, cidrMask: 22, name: "public-subnet-a" },
    {
      type: awsx.ec2.SubnetType.Private,
      cidrMask: 20,
      name: "private-subnet-a",
    },
  ],
  tags: {
    Name: "vpc-a",
  },
});
