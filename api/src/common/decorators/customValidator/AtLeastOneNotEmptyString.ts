import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOneNotEmptyString(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOneNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: properties,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          for (const propName of args.constraints) {
            const prop = (args.object as any)[propName];
            if (typeof prop === 'string' && prop.length) return true;
          }
          return false;
        },
      },
    });
  };
}
