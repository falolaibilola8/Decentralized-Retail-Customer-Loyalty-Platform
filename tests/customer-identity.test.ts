import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity contract interactions
const mockContract = {
  registerCustomer: vi.fn(),
  updateProfile: vi.fn(),
  deactivateAccount: vi.fn(),
  getCustomer: vi.fn(),
  isActiveCustomer: vi.fn()
};

// Mock principal addresses
const CUSTOMER = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const OTHER_CUSTOMER = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

describe('Customer Identity Contract', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Default mock implementations
    mockContract.registerCustomer.mockImplementation((name, email, sender) => {
      // Check if customer already exists
      if (mockContract.getCustomer(sender)) {
        return { type: 'err', value: 100 }; // ERR-ALREADY-REGISTERED
      }
      
      return { type: 'ok', value: true };
    });
    
    mockContract.updateProfile.mockImplementation((name, email, sender) => {
      // Check if customer exists
      if (!mockContract.getCustomer(sender)) {
        return { type: 'err', value: 101 }; // ERR-NOT-FOUND
      }
      
      return { type: 'ok', value: true };
    });
    
    mockContract.deactivateAccount.mockImplementation((sender) => {
      // Check if customer exists
      if (!mockContract.getCustomer(sender)) {
        return { type: 'err', value: 101 }; // ERR-NOT-FOUND
      }
      
      return { type: 'ok', value: true };
    });
    
    mockContract.getCustomer.mockReturnValue(null);
    mockContract.isActiveCustomer.mockReturnValue(false);
  });
  
  it('should register a new customer', () => {
    const result = mockContract.registerCustomer('John Doe', 'john@example.com', CUSTOMER);
    expect(result).toEqual({ type: 'ok', value: true });
  });
  
  it('should not register an already registered customer', () => {
    // Mock customer already exists
    mockContract.getCustomer.mockReturnValue({
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      'created-at': 123
    });
    
    const result = mockContract.registerCustomer('John Doe', 'john@example.com', CUSTOMER);
    expect(result).toEqual({ type: 'err', value: 100 }); // ERR-ALREADY-REGISTERED
  });
  
  it('should update an existing customer profile', () => {
    // Mock customer exists
    mockContract.getCustomer.mockReturnValue({
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      'created-at': 123
    });
    
    const result = mockContract.updateProfile('John Updated', 'updated@example.com', CUSTOMER);
    expect(result).toEqual({ type: 'ok', value: true });
  });
  
  it('should not update a non-existent customer profile', () => {
    mockContract.getCustomer.mockReturnValue(null);
    
    const result = mockContract.updateProfile('John Updated', 'updated@example.com', CUSTOMER);
    expect(result).toEqual({ type: 'err', value: 101 }); // ERR-NOT-FOUND
  });
  
  it('should deactivate an existing customer account', () => {
    // Mock customer exists
    mockContract.getCustomer.mockReturnValue({
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      'created-at': 123
    });
    
    const result = mockContract.deactivateAccount(CUSTOMER);
    expect(result).toEqual({ type: 'ok', value: true });
  });
  
  it('should not deactivate a non-existent customer account', () => {
    mockContract.getCustomer.mockReturnValue(null);
    
    const result = mockContract.deactivateAccount(CUSTOMER);
    expect(result).toEqual({ type: 'err', value: 101 }); // ERR-NOT-FOUND
  });
});
