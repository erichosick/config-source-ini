import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import IniSource from '../../src/index';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('IniSource', () => {
  it('should expose library correctly', () => {
    expect(IniSource, 'should be a function').to.be.a('function');
  });

  describe('reading invalid files', () => {
    it('should exception when a file does not exist', async () => {
      const fileName = `${__dirname}/test-files/ini-source/no-such-file-01.ini`;
      const iniSource = new IniSource(fileName);
      await expect(iniSource.loadConfig()).to.be.rejectedWith(
        `ENOENT: no such file or directory, open '${fileName}'`,
      );
    });

    it('should exception when a file extension is not supported', async () => {
      const fileName = `${__dirname}/test-files/ini-source/file.noext`;
      const iniSource = new IniSource(fileName);
      await expect(iniSource.loadConfig()).to.be.rejectedWith(
        "File extension 'noext' not supported",
      );
    });

    it('should exception when a file extension is not provided', async () => {
      const fileName = `${__dirname}/test-files/ini-source/file`;
      const iniSource = new IniSource(fileName);
      await expect(iniSource.loadConfig()).to.be.rejectedWith(
        `File '${fileName}' is not a valid or is missing a file extension`,
      );
    });

    it('should exception when an empty file name is provided', async () => {
      const iniSource = new IniSource('');
      await expect(iniSource.loadConfig()).to.be.rejectedWith(
        "File '' is not a valid or is missing a file extension",
      );
    });
  });

  describe('reading a .ini file', () => {
    it('should read from a valid .ini file', async () => {
      const sourceType = await new IniSource(
        `${__dirname}/test-files/ini-source/valid-01.ini`,
      ).loadConfig();
      expect(sourceType.description, 'should have correct description').to.contain(
        'tests/src/test-files/ini-source/valid-01.ini',
      );
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        test: 'valid-01.ini',
      });
    });

    it('should return an empty object when reading from an invalid .ini file', async () => {
      const fileName = `${__dirname}/test-files/ini-source/invalid-01.ini`;
      const iniSource = new IniSource(fileName);
      const sourceType = await iniSource.loadConfig();
      expect(sourceType.data, 'should be empty').to.deep.equal({});
    });

    it('should read from an empty .ini file creating an empty source.', async () => {
      const fileName = `${__dirname}/test-files/ini-source/empty-01.ini`;
      const iniSource = new IniSource(fileName);
      const sourceType = await iniSource.loadConfig();
      expect(sourceType.data, 'should be empty').to.deep.equal({});
    });
  });

  describe('reading into a different root', () => {
    it(`should use the root provided in rootOffset as
        opposed to using default root`, async () => {
      const sourceType = await new IniSource(
        `${__dirname}/test-files/ini-source/valid-01.ini`,
        'new.location',
      ).loadConfig();
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        new: { location: { test: 'valid-01.ini' } },
      });
    });

    it("should not care if the rootOffset is empty string ('')", async () => {
      const sourceType = await new IniSource(
        `${__dirname}/test-files/ini-source/valid-01.ini`,
        '',
      ).loadConfig();
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        test: 'valid-01.ini',
      });
    });
  });
});
