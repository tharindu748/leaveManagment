export class CreateRegUserDto {
  employeeId: string;
  name: string;
  cardNumber?: string;
  validFrom?: string;
  validTo?: string;
}

export class UpdateRegUserDto {
  epfNo?: string;
  nic?: string;
  jobPosition?: string;
}
