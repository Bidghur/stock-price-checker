import { HttpModule, HttpService } from "@nestjs/axios";
import { Test } from '@nestjs/testing';
import { FinnhubStockService } from "./finnhub-stock.service";
import { HttpException, Logger } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { FinnhubStockResponse } from "./finnhub-stock-response.model";
import { AxiosError, AxiosResponse } from "axios";
import { FinnhubStockErrorResponse } from "./finnuhb-stock-error-response.model";

jest.mock('../config/config', () => ({
    FINNHUB_URL: 'test_url'
}))

describe('Finngub Stock Service', () => {
    let httpService: HttpService;
    let finnhubStockService: FinnhubStockService;
    let logger: Logger

  beforeEach(async () => {
    const module = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [FinnhubStockService, Logger],
      }).compile();

      httpService = module.get<HttpService>(HttpService);
      finnhubStockService = module.get<FinnhubStockService>(FinnhubStockService);
      logger = module.get<Logger>(Logger)
  });

  const mockedAxiosResponse: AxiosResponse<FinnhubStockResponse> = {
    config: {} as any,
    headers: {} as any,
    status: 200,
    statusText: 'Mocked response',
    data: {
        c: 169.58,
        d: 0.76,
        dp: 0.4502,
        h: 170.38,
        l: 168.95,
        o: 169.5,
        pc: 168.82,
        t: 1712347201
    } as FinnhubStockResponse
}

  it('Should get back finnhub stock response', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => of(mockedAxiosResponse))

    const result = await finnhubStockService.getFinnHubResponseBySymbol('AAPL')
    expect(result).toBeDefined()
    expect(result).toEqual(mockedAxiosResponse.data) 
  })

  it('Should generate correct URL', async () => {
    const httpSpy = jest.spyOn(httpService, 'get').mockImplementation(() => of(mockedAxiosResponse))
    await finnhubStockService.getFinnHubResponseBySymbol('AAPL')

    const expectedOptions = {
        headers: {
            'X-Finnhub-Token': process.env.FINNHUB_TOKEN
        }
    }

    expect(httpSpy).not.toHaveBeenCalledWith('test_url/quote?symbol=testSymbol', expectedOptions)
    expect(httpSpy).toHaveBeenCalledWith('test_url/quote?symbol=AAPL', expectedOptions)
  })

  it('Should throw an error if api call fails', async () => {
    const mockError: AxiosError<FinnhubStockErrorResponse> = {
        response: {
            data: {
                error: 'test error'
            }
        }
    } as any
    jest.spyOn(httpService, 'get').mockImplementation(() => throwError(mockError))
    const loggerspy = jest.spyOn(logger, 'error')

    const expectedError = new HttpException('Error while fetching Finnhub response: test error', 500)
    expect(finnhubStockService.getFinnHubResponseBySymbol('AAPL')).rejects.toEqual(expectedError)
    expect(loggerspy).toHaveBeenCalledWith('Error while fetching Finnhub response: test error')
  })

  it('Should return true if symbol valid', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => of(mockedAxiosResponse))

    const isSymbolValid = await finnhubStockService.isSymbolValid('test')
    expect(isSymbolValid).toBeTruthy()
  })

  it('Should return false if symbol not valid', async () => {
    const notValidAxiosResponse: AxiosResponse<FinnhubStockResponse, any> = {} as any
    Object.assign(notValidAxiosResponse, mockedAxiosResponse)
    notValidAxiosResponse.data.c = 0
    jest.spyOn(httpService, 'get').mockImplementation(() => of(mockedAxiosResponse))

    const isSymbolValid = await finnhubStockService.isSymbolValid('test')
    expect(isSymbolValid).toBeFalsy()
  })
  
})