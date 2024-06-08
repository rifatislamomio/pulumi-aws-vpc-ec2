# Pulumi with AWS Services

## Description
Configuring, deploying and managing AWS VPC and EC2 instances using Pulumi's Typescipt SDK for infrastructure as code. 

## Project Explanation: 
***VPC***: Created a VPC with a CIDR block of `100.0.0.0/16`.

***Subnets***: 
- Created a public subnet within the VPC with a CIDR block of `100.0.1.0/24` and enable public IP assignment on launch.
- Created a private subnet within the VPC with a CIDR block of `100.0.2.0/24`.

***Internet Gateway***: An internet gateway is created and attached to the VPC to allow internet access from public subnet.

***NAT Gateway***: An NAT gateway is created and attached to the VPC to allow internet access from private subnet.

***Route Tables***: 
- A route table is created with a route that directs all traffic `(0.0.0.0/0)` to the internet gateway.
- Another route table is created that directs all traffic `(0.0.0.0/0)` to the NAT gateway

***Route Table Association***: The route tables are associated with the specific subnets to apply the routing rules.

***Security Group***: 
- Security group for the bastion EC2 instance is created to allow `SSH` (port 22) and `HTTP` (port 80) access from anywhere.
- Another security group for the primary EC2 instance is created to allow everything within the VPC CIDR block.

***EC2 Instance***: Two EC2 instances are launched, one under public subnet (bastion) and another under private subnet.
